package io.cumulus.controllers

import akka.stream.scaladsl.Source
import akka.util.ByteString
import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.{FileDownloaderUtils, UserAuthentication}
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.persistence.query.{QueryOrderingDirection, QueryPagination}
import io.cumulus.core.validation.AppError
import io.cumulus.models.Path
import io.cumulus.models.fs.{Directory, FsNodeType}
import io.cumulus.models.sharing.Sharing
import io.cumulus.services.{FsNodeService, SessionService, SharingService, StorageService}
import io.cumulus.stages._
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

/**
  * Controller for all the operations on the filesystem.
  */
class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  settings: Settings
) extends AbstractController(cc) with UserAuthentication with ApiUtils with FileDownloaderUtils with BodyParserJson with BodyParserStream {

  /**
    * List all the elements of the filesysteme.
    */
  def index: Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        fsNodeService.getIndex
      }
    }

  /**
    * Gets a filesystem element by its path.
    *
    * @param path The path of the element.
    * @param contentLimit The maximum number of children elements (for a directory) to return. Used for pagination.
    * @param contentOffset The offset of children elements (for a directory) to return. Used for pagination.
    */
  def get(path: Path, contentLimit: Option[Int], contentOffset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        val pagination = QueryPagination(contentLimit, contentOffset)

        fsNodeService.findNode(path, pagination)
      }
    }

  /**
    * Gets the content of a directory by its path.
    *
    * @param path The path of the directory.
    * @param contentLimit The maximum number of children elements to return. Used for pagination.
    * @param contentOffset The offset of children elements to return. Used for pagination.
    */
  def getContent(path: Path, contentLimit: Option[Int], contentOffset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        // TODO add ordering
        val pagination = QueryPagination(contentLimit, contentOffset)

        fsNodeService.findContent(path, pagination)
      }
    }

  /**
    * Searches through the filesystem.
    *
    * @param path Root element for the search. Use '/' to search in the whole filesystem.
    * @param name Name to look for. Approximation are allowed.
    * @param nodeType The optional type of node to look for.
    * @param mimeType The optional mime type to look for.
    * @param limit The maximum number of elements to be returned. Used for pagination.
    * @param offset The offset of elements to be returned. Used for pagination.
    */
  def search(
    path: Path,
    name: String,
    nodeType: Option[FsNodeType],
    mimeType: Option[String],
    limit: Option[Int],
    offset: Option[Int]
  ): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse.paginated {
        val pagination = QueryPagination(limit, offset)

        fsNodeService.searchNodes(path, name, nodeType, mimeType, pagination)
      }
    }

  /**
    * Downloads a file by its path.
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
    * Downloads a file's thumbnail.
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
    * Uploads a new file.
    *
    * @param path The path of the new file.
    * @param cipherName The cipher to use.
    * @param compressionName The compression to use.
    */
  def upload(path: Path, cipherName: Option[String], compressionName: Option[String]): Action[Source[ByteString, _]] =
    AuthenticatedAction.async(streamBody) { implicit request =>
      ApiResponse {
        storageService.uploadFile(path, cipherName, compressionName, request.body)
      }
    }

  /**
    * Creates a new directory.
    *
    * @param path The path of the new directory.
    */
  def create(path: Path): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        val directory = Directory.create(request.authenticatedSession.user, path)

        fsNodeService.createDirectory(directory)
      }
    }

  /**
    * Updates a file.
    *
    * @param path The file to update.
    */
  def update(path: Path): Action[FsOperation] =
    AuthenticatedAction.async(parseJson[FsOperation]) { implicit request =>
      request.body match {
        case FsOperationCreate(_) =>
          val directory = Directory.create(request.authenticatedSession.user, path)
          ApiResponse(fsNodeService.createDirectory(directory))
        case FsOperationMove(to) =>
          ApiResponse(fsNodeService.moveNode(path, to))
        case FsOperationShareLink(_, duration, _) =>
          ApiResponse {
            sharingService.shareNode(path, duration).map {
              case Right((sharing, secretCode)) =>
                Right(Json.toJsObject(sharing)(Sharing.apiWrite)
                  + ("key" -> Json.toJson(secretCode))
                  + ("download" -> JsString(routes.SharingPublicController.downloadRoot(sharing.reference, path.name, secretCode, None).url))
                  + ("path" -> JsString(routes.SharingPublicController.get("/", sharing.reference, secretCode).url))
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
    * @param path The path of the file to delete.
    */
  def delete(path: Path): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        storageService.deleteNode(path)
      }
    }

}

