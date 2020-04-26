package io.cumulus.controllers.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.{Directive1, Route}
import akka.http.scaladsl.unmarshalling.FromStringUnmarshaller
import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.api.payloads._
import io.cumulus.controllers.utils
import io.cumulus.controllers.utils.{ApiComponent, FileDownloadSupport, FileStreamingSupport}
import io.cumulus.i18n.Messages
import io.cumulus.models.fs.{Directory, FsNodeType, Path}
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.persistence.stores.orderings.{FsNodeOrdering, FsNodeOrderingType}
import io.cumulus.services.{FsNodeService, SharingService, StorageService}
import io.cumulus.stages._
import io.cumulus.validation.AppError
import io.cumulus.Settings

import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps


/**
  * Controller for all the operations on the filesystem.
  */
class FileSystemController(
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService,
  val auth: utils.Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends ApiComponent with FileDownloadSupport with FileStreamingSupport {

  implicit val fsNodeTypeUnmarshaller: FromStringUnmarshaller[FsNodeType] =
    enumUnmarshaller(FsNodeType)

  implicit val fsNodeOrderingsUnmarshaller: FromStringUnmarshaller[Seq[FsNodeOrderingType]] =
    enumListUnmarshaller(FsNodeOrderingType)

  /**
    * List all the elements of the filesystem.
    */
  val index: Route =
    (get & path("api" / "fs" / "index")) {
      withAuthentication { implicit ctx =>
        fsNodeService.getIndex.toResult
      }
    }

  /**
    * Creates a new directory.
    */
  val create: Route =
    (put & path("api" / "fs") & payload[DirectoryCreationPayload]) { payload =>
      withAuthentication { implicit ctx =>
        val directory = Directory.create(ctx.user, payload.path)

        fsNodeService
          .createDirectory(directory)
          .toResultAs(StatusCodes.Created)
      }
    }

  /**
   * Gets a filesystem element by its unique ID.
   */
  val getById: Route =
    (post & path("api" / "fs" / JavaUUID)) { nodeId =>
      withAuthentication { implicit ctx =>
        fsNodeService.findNode(nodeId).toResult
      }
    }

  /**
    * Gets a filesystem element by its path.
    */
  val getByPath: Route =
    (get & path("api" / "fs") & parameters('path.as[Path])) { path =>
      withAuthentication { implicit ctx =>
        fsNodeService.findNode(path).toResult
      }
    }

  val update: Route =
    (post & path("api" / "fs") & payload[FsNodesUpdatePayload]) { payload =>
      withAuthentication { implicit ctx =>
        payload match {
          case FsNodesDisplacementPayload(nodes, destination) =>
            fsNodeService.moveNodes(nodes, destination).toResult
          case FsNodesDeletionPayload(nodes, deleteContent) =>
            fsNodeService.deleteNodes(nodes, deleteContent).toResult
        }
      }
    }

  case class ContentParams(
    order: Option[Seq[FsNodeOrderingType]],
    nodeType: Option[FsNodeType]
  )

  object ContentParams {

    def extract: Directive1[ContentParams] =
      parameters(
        'order.as[Seq[FsNodeOrderingType]] ?,
        'nodeType.as[FsNodeType] ?
      ).as[ContentParams](ContentParams.apply _)

  }

  /**
    * Gets the content of a directory by its unique ID.
    */
  val getContent: Route =
    (get & path("api" / "fs" / JavaUUID / "content") & ContentParams.extract & paginationParams) { (nodeId, params, pagination) =>
      withAuthentication { implicit ctx =>
          fsNodeService.findContent(
            nodeId,
            pagination,
            params.order.map(FsNodeOrdering(_)).getOrElse(FsNodeOrdering.default),
            params.nodeType
          ).toResult
        }
    }

  /**
    * Gets the sharings of a node by its unique ID.
    */
  val getSharings: Route =
    (get & path("api" / "fs" / JavaUUID / "sharings") & paginationParams) { (nodeId, pagination) =>
      withAuthentication { implicit ctx =>
        // TODO add ordering
        sharingService.listSharings(nodeId, pagination).toResult
      }
    }

  /**
   * @param path Root element for the search. Use '/' to search in the whole filesystem.
   * @param name Name to look for. Approximation are allowed.
   * @param recursiveSearch If the search should include only the direct children of the parent directory.
   * @param nodeType The optional type of node to look for.
   * @param mimeType The optional mime type to look for.
   */
  case class SearchParams(
    path: Path,
    name: String,
    recursiveSearch: Option[Boolean],
    nodeType: Option[FsNodeType],
    mimeType: Option[String]
  )

  object SearchParams {

    def extract: Directive1[SearchParams] =
      parameters(
        'path.as[Path],
        'name,
        'recursiveSearch.as[Boolean] ?,
        'nodeType.as[FsNodeType] ?,
        'mimeType ?
      ).as[SearchParams](SearchParams.apply _)

  }

  /**
    * Searches through the filesystem.
    */
  val search: Route =
    (get & path("api" / "fs" / "search") & SearchParams.extract & paginationParams) { (params, pagination) =>
      withAuthentication { implicit ctx =>
        fsNodeService.searchNodes(
          params.path,
          params.name,
          params.recursiveSearch,
          params.nodeType,
          params.mimeType,
          pagination
        ).toResult
      }
    }

  /**
   * @param filename The name of the file.
   * @param cipherName The cipher to use.
   * @param compressionName The compression to use.
   */
  case class UploadParams(
    filename: String,
    cipherName: Option[String],
    compressionName: Option[String]
  )

  object UploadParams {

    def extract: Directive1[UploadParams] =
      parameters(
        'filename,
        'cipherName ?,
        'compressionName ?
      ).as[UploadParams](UploadParams.apply _)

  }

  /**
    * Uploads a new file.
    */
  val upload: Route =
    (post & path("api" / "fs" / JavaUUID / "upload") & UploadParams.extract & extractDataBytes) { (parentId, params, rawBody) =>
      withAuthentication { implicit ctx =>
        storageService
          .uploadFile(
            parentId,
            params.filename,
            params.cipherName,
            params.compressionName,
            rawBody
          )
          .toResult
      }
    }

  /**
   * @param forceDownload True to force the download, otherwise content will be opened directly in the browser.
   */
  case class DownloadParams(
    forceDownload: Option[Boolean],
    range: Option[String]
  )

  object DownloadParams {

    def extract: Directive1[DownloadParams] =
      (parameter('forceDownload.as[Boolean] ?) & optionalHeaderValueByName("range"))
        .as[DownloadParams](DownloadParams.apply _)

  }

  /**
    * Downloads a file by its unique ID.
    */
  val download: Route =
    (get & path("api" / "fs" / JavaUUID / "download") & DownloadParams.extract) { (fileId, params) =>
      withAuthentication { implicit ctx =>
        val response = for {
          // Get the file
          file <- EitherT(fsNodeService.findFile(fileId)) // TODO fix (why ?)

          // Get the file's content
          maybeRange <- EitherT.fromEither[Future](parseRange(params.range, file))
          content    <- EitherT.fromEither[Future](storageService.downloadFile(file, maybeRange))

          // Create the response
          response <- EitherT.pure[Future, AppError](
            maybeRange match {
              case Some(range) =>
                streamFile(file, content, range)
              case None =>
                downloadFile(file, content, params.forceDownload.getOrElse(false))
            }
          )
        } yield response

        response.toResult
      }
    }

  /**
    * Downloads a file's thumbnail.
    */
  val downloadThumbnail: Route =
    (get & path("api" / "fs" / JavaUUID / "thumbnail") & DownloadParams.extract) { (fileId, params) =>
      withAuthentication { implicit ctx =>
        val response = for {
          // Get the file
          file <- EitherT(fsNodeService.findFile(fileId))

          // Get the file thumbnail's content
          content <- EitherT(storageService.downloadThumbnail(fileId))

          // Create the response
          response <- EitherT.pure[Future, AppError] {
            file.thumbnailStorageReference match {
              case Some(thumbnailStorageReference) =>
                downloadFile(
                  s"thumbnail_${file.name}",
                  thumbnailStorageReference.size,
                  ThumbnailGenerator.thumbnailMimeType,
                  content,
                  params.forceDownload.getOrElse(false)
                )
              case _ =>
                // Should never happen
                AppError.notFound("error.validation.fs-node.no-thumbnail", file.name).toResult
            }
          }

        } yield response

        response.toResult
      }
    }

  /**
    * Moves a node.
    */
  val move: Route =
    (post & path("api" / "fs" / JavaUUID) & payload[FsNodeUpdatePayload]) { (nodeId, payload) =>
      withAuthentication { implicit ctx =>
        fsNodeService.moveNode(nodeId, payload.path).toResult
      }
    }

  /**
    * Delete a file by its unique ID.
    */
  val deleteById: Route =
    (delete & path("api" / "fs" / JavaUUID)) { nodeId =>
      withAuthentication { implicit ctx =>
        storageService.deleteNode(nodeId).toResult
      }
    }

  val routes: Route =
    concat(
      index,
      create,
      getByPath,
      getById,
      update,
      getContent,
      getSharings,
      search,
      upload,
      download,
      downloadThumbnail,
      move,
      deleteById
    )

}
