package io.cumulus.persistence.storage

import io.cumulus.stream.storage.{StorageReferenceReader, StorageReferenceWriter}

class Storage(
  val engines: StorageEngines,
  val referenceReader: StorageReferenceReader,
  val referenceWriter: StorageReferenceWriter
) {

  def defaultEngine: StorageEngine =
    engines.default

}
