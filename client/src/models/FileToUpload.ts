import { Compression, Cipher } from "models/FsNode"

export interface FileToUpload {
  id: number
  progress: number
  loading: boolean
  file: File
  compression?: Compression
  cipher?: Cipher
}
