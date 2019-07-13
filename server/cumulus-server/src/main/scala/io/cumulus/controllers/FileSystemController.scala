package io.cumulus.controllers

import java.util.UUID

import akka.stream.scaladsl.Source
import akka.util.ByteString
import cats.data.EitherT
import cats.implicits._
import io.cumulus.Settings
import io.cumulus.controllers.payloads._
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.validation.AppError
import io.cumulus.models.fs.{Directory, FsNodeType, Path}
import io.cumulus.persistence.stores.orderings.FsNodeOrdering
import io.cumulus.services.{FsNodeService, SessionService, SharingService, StorageService}
import io.cumulus.stages._
import play.api.mvc.{Action, AnyContent, ControllerComponents}

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
  val settings: Settings
) extends Api(cc) with DownloadSupport with StreamSupport {

  /**
    * List all the elements of the filesystem.
    */
  def index: Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      fsNodeService.getIndex.toResult
    }

  /**
    * Creates a new directory.
    */
  def create: Action[DirectoryCreationPayload] =
    AuthenticatedAction.async(parseJson[DirectoryCreationPayload]) { implicit request =>
      val payload = request.body
      val directory = Directory.create(request.authenticatedSession.user, payload.path)

      fsNodeService.createDirectory(directory).toResult
    }

  /**
    * Gets a filesystem element by its path.
    *
    * @param path The path of the element.
    */
  def getByPath(path: Path): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      fsNodeService.findNode(path).toResult
    }

  def update: Action[FsNodesUpdatePayload] =
    AuthenticatedAction.async(parseJson[FsNodesUpdatePayload]) { implicit request =>
      val payload = request.body

      println(payload)

      payload match {
        case FsNodesDisplacementPayload(nodes, destination) =>
          fsNodeService.moveNodes(nodes, destination).toResult
        case FsNodesDeletionPayload(nodes, deleteContent) =>
          fsNodeService.deleteNodes(nodes, deleteContent).toResult
      }
    }

  /**
    * Gets a filesystem element by its unique ID.
    *
    * @param id The ID of the element.
    */
  def get(id: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      fsNodeService.findNode(id).toResult
    }

  /**
    * Gets the content of a directory by its unique ID.
    *
    * @param id The ID of the directory.
    * @param limit The maximum number of children elements to return. Used for pagination.
    * @param offset The offset of children elements to return. Used for pagination.
    */
  def getContent(
    id: UUID,
    limit: Option[Int],
    offset: Option[Int],
    order: Option[FsNodeOrdering],
    nodeType: Option[FsNodeType]
  ): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      val pagination = QueryPagination(limit, offset)

      fsNodeService.findContent(id, pagination, order.getOrElse(FsNodeOrdering.default), nodeType).toResult
    }

  /**
    * Gets the sharings of a node by its unique ID.
    *
    * @param id The ID of the node.
    * @param limit The maximum number of children elements to return. Used for pagination.
    * @param offset The offset of children elements to return. Used for pagination.
    */
  def getSharings(id: UUID, limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      // TODO add ordering
      val pagination = QueryPagination(limit, offset)

      sharingService.listSharings(id, pagination).toResult
    }


  /**
    * Searches through the filesystem.
    *
    * @param path Root element for the search. Use '/' to search in the whole filesystem.
    * @param name Name to look for. Approximation are allowed.
    * @param recursiveSearch If the search should include only the direct children of the parent directory.
    * @param nodeType The optional type of node to look for.
    * @param mimeType The optional mime type to look for.
    * @param limit The maximum number of elements to be returned. Used for pagination.
    * @param offset The offset of elements to be returned. Used for pagination.
    */
  def search(
    path: Path,
    name: String,
    recursiveSearch: Option[Boolean],
    nodeType: Option[FsNodeType],
    mimeType: Option[String],
    limit: Option[Int],
    offset: Option[Int]
  ): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      val pagination = QueryPagination(limit, offset)

      fsNodeService.searchNodes(path, name, recursiveSearch, nodeType, mimeType, pagination).toResult
    }

  /**
    * Uploads a new file.
    *
    * @param id The ID of the parent directory.
    * @param filename The name of the file.
    * @param cipherName The cipher to use.
    * @param compressionName The compression to use.
    */
  def upload(
    id: UUID,
    filename: String,
    cipherName: Option[String],
    compressionName: Option[String]
  ): Action[Source[ByteString, _]] =
    AuthenticatedAction.async(streamBody) { implicit request =>
      storageService
        .uploadFile(
          id,
          filename,
          cipherName,
          compressionName,
          request.body
        )
        .toResult // TODO fix
    }

  /**
    * Downloads a file by its unique ID.
    *
    * @param id The ID of the file to download.
    * @param forceDownload True to force the download, otherwise content will be opened directly in the browser.
    */
  def download(id: UUID, forceDownload: Option[Boolean]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      for {
        // Get the file
        file <- EitherT(fsNodeService.findFile(id)) // TODO fix

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
      } yield result.toResult
    }

  /**
    * Downloads a file's thumbnail.
    *
    * @param id The ID of the file.
    * @param forceDownload True to force the download, otherwise content will be opened directly in the browser.
    */
  def downloadThumbnail(id: UUID, forceDownload: Option[Boolean]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      for {
        // Get the file
        file <- EitherT(fsNodeService.findFile(id))

        // Get the file thumbnail's content
        content <- EitherT(storageService.downloadThumbnail(id))

        // Create the response
        result <- EitherT.pure[Future, AppError]{
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
              AppError.notFound("validation.fs-node.no-thumbnail", file.name).toResult
          }
        }

      } yield result
    }


  /**
    * Moves a node.
    *
    * @param id The ID of the node to be moved.
    */
  def move(id: UUID): Action[FsNodeUpdatePayload] =
    AuthenticatedAction.async(parseJson[FsNodeUpdatePayload]) { implicit request =>
      val payload = request.body

      fsNodeService.moveNode(id, payload.path).toResult
    }

  /**
    * Delete a file by its unique ID.
    * @param id The ID of the file to delete.
    */
  def delete(id: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      storageService.deleteNode(id).toResult
    }

}

