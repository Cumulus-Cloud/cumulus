package io.cumulus.persistence

import com.sksamuel.elastic4s.http.JavaClient
import com.sksamuel.elastic4s.requests.mappings.MappingDefinition
import com.sksamuel.elastic4s.{ElasticClient, ElasticProperties}
import io.cumulus.Settings


class EsClient(mappings: Seq[(String, MappingDefinition)])(implicit settings: Settings) {

  import com.sksamuel.elastic4s.ElasticDsl._

  private val props: ElasticProperties = ElasticProperties(settings.elastic.url)
  val client: ElasticClient = ElasticClient(JavaClient(props))

  // Init the mappings
  mappings.map {
    case (index, mapping) =>
      client.execute {
        createIndex(index).mapping(mapping)
      }
  }

}
