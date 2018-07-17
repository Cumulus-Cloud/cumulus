import { ApiError } from './../../models/ApiError'
import { Directory, FsNode } from './../../models/FsNode'

export default interface FsState {
  loadingCurrent: boolean
  loadingContent: boolean
  current?: Directory
  content?: FsNode[]
  error?: ApiError
}
