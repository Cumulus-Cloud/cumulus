import { ApiError } from './../../models/ApiError'
import { Directory } from './../../models/FsNode'

export default interface UserState {
  loadingCurrent: Boolean
  current?: Directory
  error?: ApiError
}
