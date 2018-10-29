
export interface EnrichedFile {
  /** Unique ID of the file. */
  id: string
  /** The path of the file. */
  location: string
  /** Underlying browser API file. */
  file: File
  /** Name of the file. Path will be constructed with the filename and the location. */
  filename: string
  /** If the file should be compressed. */
  compressed: boolean
  /** If the file should be crypted. */
  crypted: boolean
}
