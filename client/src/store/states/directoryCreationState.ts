import { AppError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

export default interface DirectoryCreationState {
  loading: boolean
  createdDirectory?: Directory
  error?: AppError
}
