package io.cumulus.persistence.storage


class Storage(
  val engines: StorageEngines,
  val referenceReader: StorageReferenceReader,
  val referenceWriter: StorageReferenceWriter
) {

  def defaultEngine: StorageEngine =
    engines.default

}
