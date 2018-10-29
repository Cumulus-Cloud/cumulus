import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

export default interface DirectoryCreationState {
  loading: boolean
  createdDirectory?: Directory
  error?: ApiError
}
