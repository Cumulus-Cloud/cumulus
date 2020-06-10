package io.cumulus.services

import java.util.UUID

import com.sksamuel.elastic4s.ElasticDsl._
import com.sksamuel.elastic4s.requests.script.Script
import com.sksamuel.elastic4s.{RequestFailure, RequestSuccess}
import io.cumulus.models.fs._
import io.cumulus.models.user.User
import io.cumulus.persistence.EsClient
import io.cumulus.persistence.query.QueryE._
import io.cumulus.persistence.query.QueryRunner._
import io.cumulus.persistence.query.{QueryE, QueryPagination, QueryRunner}
import io.cumulus.persistence.stores.FsNodeStore
import io.cumulus.utils.PaginatedList._
import io.cumulus.utils.{Logging, PaginatedList}
import io.cumulus.validation.AppError
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future}


class FsNodeSearchService(
  fsNodeStore: FsNodeStore,
  esClient: EsClient
)(
  implicit
  sqlQueryRunner: QueryRunner[Future],
  ec: ExecutionContext
) extends Logging {

  /**
   * Search through all the user's nodes.
   *
   * @param parent The node parent.
   * @param name The node's partial name.
   * @param nodeType The optional node type.
   * @param pagination The pagination of the research.
   * @param user The user performing the operation.
   */
  def searchNodes(
    parent: Path,
    name: String,
    recursiveSearch: Option[Boolean],
    nodeType: Option[FsNodeType],
    mimeType: Option[String],
    pagination: QueryPagination
  )(implicit user: User): Future[Either[AppError, PaginatedList[FsNode]]] = {
    // TODO handle ordering

    if (pagination.offset.getOrElse(0) + pagination.limit + 1 > 10000) {
      // ES can't handle more than 10k elements in its pagination. Since its our search endpoint its
      // not really a big deal, because who in its right mind will scroll through more than 10k files
      Future.successful(Left(AppError.validation("error.pagination.too-large")))
    } else {

      // First part - es query
      esClient.client.execute {

        // Prepare all the elements of the ES query
        val nameQuery =
          matchQuery("name", name)

        val nodeTypeFilter =
          nodeType match {
            case Some(nodeType) =>
              Seq(termQuery("nodeType", nodeType.entryName)) // Exact match
            case None =>
              Seq.empty
          }

        val mimeTypeFilter =
          mimeType match {
            case Some(mimeType) =>
              Seq(termQuery("mimeType", mimeType)) // Exact math
            case None =>
              Seq.empty
          }

        val parentFilter =
          Seq(
            // Parent filter
            if (recursiveSearch.getOrElse(false)) {
              prefixQuery("path", parent.toString) // Match start of the path
            } else {
              termQuery("path", parent.toString) // Exact match
            }
          )

        search(FsNodeSearch.index)
          .query {
            boolQuery().must(
              nameQuery
            ).filter {
              parentFilter ++ mimeTypeFilter ++ nodeTypeFilter
            }
          }
          .from(pagination.offset.getOrElse(0))
          .size(pagination.limit + 1) // One more to be sure
      } map {
        case RequestSuccess(_, _, _, result) =>
          Right(result.hits.hits.map(_.id).map(UUID.fromString(_))) // We just need to keep the IDs
        case RequestFailure(_, _, _, error) =>
          logger.warn(error.reason)
          Left(AppError.technical) // TODO return the error
      } map { maybeIds =>
        // Second part - Postgres query
        for {
          ids             <- QueryE.pure(maybeIds).map(_.take(pagination.limit))
          result          <- QueryE.lift(fsNodeStore.findAll(ids))
          paginatedResult =  result.toPaginatedList(offset = pagination.offset, hasMore = ids.length > pagination.limit)
        } yield paginatedResult

      } flatMap (_.run())
    }
  }

  /** TODO */
  def indexNodeForSearch(fsNode: FsNode): Future[Either[AppError, Unit]] = {
    import com.sksamuel.elastic4s.ElasticDsl._

    val indexedFsNode =
      FsNodeSearch.fromFsNode(fsNode)

    esClient.client.execute {
      indexInto(FsNodeSearch.index)
        .doc(Json.stringify(Json.toJson(indexedFsNode)))
        .withId(indexedFsNode.id.toString)
    } map {
      case RequestSuccess(_, _, _, _) =>
        Right(())
      case RequestFailure(_, _, _, error) =>
        logger.error(error.reason)
        Left(AppError.technical)
    }

  }

  /** TODO */
  def removeNodeForSearch(fsNode: FsNode): Future[Either[AppError, Unit]] = {
    import com.sksamuel.elastic4s.ElasticDsl._

    esClient.client.execute {
      // Delete by ID
      deleteById(FsNodeSearch.index, fsNode.id.toString)
    } map {
      case RequestSuccess(_, _, _, _) =>
        Right(())
      case RequestFailure(_, _, _, error) =>
        logger.error(error.reason)
        Left(AppError.technical)
    }

  }

  /** TODO */
  def removeNodeWithChildrenForSearch(parent: FsNode): Future[Either[AppError, Unit]] = {
    import com.sksamuel.elastic4s.ElasticDsl._

    esClient.client.execute {
      // Delete all children elements (and the parent)
      deleteByQuery(FsNodeSearch.index, prefixQuery("path", parent.toString))
    } map {
      case RequestSuccess(_, _, _, _) =>
        Right(())
      case RequestFailure(_, _, _, error) =>
        logger.error(error.reason)
        Left(AppError.technical)
    }
  }

  /** TODO */
  def moveNodeWithChildrenForSearch(parent: FsNode): Future[Either[AppError, Unit]] = {
    import com.sksamuel.elastic4s.ElasticDsl._

    esClient.client.execute {
      // Change the path of all sub elements using a regex
      // TODO see https://stackoverflow.com/questions/48900011/elasticsearch-update-doc-string-replacement
      ???

      updateByQuery(FsNodeSearch.index, prefixQuery("path", parent.toString))
        .script(Script(""""
          ctx._source.data.path = ctx._source.data.path
        """).lang("painless"))
      // See https://stackoverflow.com/questions/47698187/how-to-replace-string-without-regexp-inside-painless-inline-script-for-aws-elast

    } map {
      case RequestSuccess(_, _, _, _) =>
        Right(())
      case RequestFailure(_, _, _, error) =>
        logger.error(error.reason)
        Left(AppError.technical)
    }
  }

}
