import { ApiError } from './../../../models/ApiError'
import { EnrichedFile } from "../../../models/EnrichedFile"

export interface FileUploadingState {
  file: EnrichedFile
  progress: number
  loading: boolean
  start: Date
  error?: ApiError
}

export default interface FileUploadState {
  files: EnrichedFile[],
  uploading: FileUploadingState[]
}
