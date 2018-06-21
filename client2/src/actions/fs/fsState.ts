import { ApiError } from './../../models/ApiError'
import { Directory } from './../../models/FsNode'

export default interface FsState {
  loadingCurrent: boolean
  current?: Directory
  error?: ApiError
}
