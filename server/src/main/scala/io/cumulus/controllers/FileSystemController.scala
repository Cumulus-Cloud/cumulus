package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import akka.stream.scaladsl.Source
import akka.util.ByteString
import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.{Directory, FsNodeType}
import io.cumulus.models.{Path, Sharing, UserSession}
import io.cumulus.persistence.services.{FsNodeService, SharingService, StorageService}
import io.cumulus.stages._
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService
)(implicit
  ec: ExecutionContext,
  ciphers: Ciphers,
  compressions: Compressions
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloaderUtils with BodyParserJson with BodyParserStream {

  /**
    * Gets a filesystem element by its path.
    * @param path The path of the element.
    * @param contentLimit The maximum number of children elements (for a directory) to return. Used for pagination.
    * @param contentOffset The offset of children elements (for a directory) to return. Used for pagination.
    */
  def get(path: Path, contentLimit: Option[Int], contentOffset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        fsNodeService.findNode(
          path,
          contentLimit
            .map(QueryPagination(_, contentOffset))
            .getOrElse(QueryPagination(51)) // Default pagination
        )
      }
    }

  /**
    * Search through the filesystem.
    *
    * @param path Root element for the search. Use '/' to search in the whole filesystem.
    * @param name Name to look for. Approximation are allowed.
    * @param nodeType The optional type of node to look for.
    * @param mimeType The optional mime type to look for.
    * @param limit The maximum number of children elements (for a directory) to return. Used for pagination.
    * @param offset The offset of children elements (for a directory) to return. Used for pagination.
    */
  def search(path: Path, name: String, nodeType: Option[FsNodeType], mimeType: Option[String], limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        fsNodeService.searchNodes(
          path,
          name,
          nodeType,
          mimeType,
          limit
            .map(QueryPagination(_, offset))
            .getOrElse(QueryPagination(51)) // Default pagination
        )
      }
    }

  /**
    * Downloads the file by its path.
    *
    * @param path The path of the file to download.
    * @param forceDownload True to force the download, otherwise content will be opened directly in the browser.
    */
  def download(path: Path, forceDownload: Option[Boolean]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse.result {
        for {
          // Get the file
          file       <- EitherT(fsNodeService.findFile(path))

          // Get the file's content
          maybeRange <- EitherT.fromEither[Future](headerRange(request, file))
          content    <- EitherT.fromEither[Future](storageService.downloadFile(file, maybeRange))

          // Create the response
          result <- EitherT.pure[Future, AppError](
            maybeRange match {
              case Some(range) =>
                streamFile(file, content, range)
              case None =>
                downloadFile(file, content, forceDownload.getOrElse(false))
            }
          )
        } yield result
      }
    }

  /**
    * Download a file's thumbnail.
    *
    * @param path The path of the file.
    * @param forceDownload True to force the download, otherwise content will be opened directly in the browser.
    */
  def downloadThumbnail(path: Path, forceDownload: Option[Boolean]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse.result {
        for {
          // Get the file
          file    <- EitherT(fsNodeService.findFile(path))

          // Get the file thumbnail's content
          content <- EitherT(storageService.downloadThumbnail(path))

          // Create the response
          result  <- EitherT.pure[Future, AppError]{
            file.thumbnailStorageReference match {
              case Some(thumbnailStorageReference) =>
                downloadFile(
                  s"thumbnail_${file.name}",
                  thumbnailStorageReference.size,
                  ThumbnailGenerator.thumbnailMimeType,
                  content,
                  forceDownload.getOrElse(false)
                )
              case _ =>
                // Should never happen
                toApiError(AppError.notFound("validation.fs-node.no-thumbnail", file.name))
            }
          }

        } yield result
      }
    }

  /**
    * Upload a new file.
    *
    * @param path The path of the new file.
    * @param cipherName The cipher to use.
    * @param compressionName The compression to use.
    */
  def upload(path: Path, cipherName: Option[String], compressionName: Option[String]): Action[Source[ByteString, _]] =
    AuthenticatedAction.async(streamBody) { implicit request =>
      ApiResponse {
        for {
          // Get the cipher and compression from the request
          cipher      <- EitherT.fromEither[Future](ciphers.get(cipherName))
          compression <- EitherT.fromEither[Future](compressions.get(compressionName))

          // Upload & create the file
          file <- EitherT(storageService.uploadFile(path, cipher, compression, request.body))

        } yield file
      }
    }

  /**
    * Create a new directory.
    *
    * @param path The path of the new directory.
    */
  def create(path: Path): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        val directory = Directory.create(request.user.id, path)
        fsNodeService.createDirectory(directory)
      }
    }

  /**
    * Update a file.
    *
    * @param path The file to update.
    */
  def update(path: Path): Action[FsOperation] =
    AuthenticatedAction.async(parseJson[FsOperation]) { implicit request =>
      request.body match {
        case FsOperationCreate(_) =>
          val directory = Directory.create(request.user.id, path)
          ApiResponse(fsNodeService.createDirectory(directory))
        case FsOperationMove(to) =>
          ApiResponse(fsNodeService.moveNode(path, to))
        case FsOperationShareLink(_, duration, _) =>
          ApiResponse {
            sharingService.shareNode(path, request.user.password, duration).map {
              case Right((sharing, secretCode)) =>
                Right(Json.toJsObject(sharing)(Sharing.apiWrite)
                  + ("key" -> Json.toJson(secretCode))
                  + ("download" -> JsString(routes.SharingController.downloadRoot(sharing.reference, path.name, secretCode, None).url))
                  + ("path" -> JsString(routes.SharingController.get("/", sharing.reference, secretCode).url))
                )
              case Left(e) =>
                Left(e)
            }
          }
        case FsOperationShareDelete(reference) =>
          ApiResponse(sharingService.deleteSharing(reference))
        case FsOperationDelete(_) =>
          ApiResponse(storageService.deleteNode(path))
      }
    }

  /**
    * Delete a file by its path.
    *
    * @param path The path of the file to delete.
    */
  def delete(path: Path): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        storageService.deleteNode(path)
      }
    }

}

