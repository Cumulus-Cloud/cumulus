import { ApiError } from './../../../models/ApiError'
import { Directory } from './../../../models/FsNode'

export default interface UserState {
  loading: Boolean
  createdDirectory?: Directory
  error?: ApiError
}
