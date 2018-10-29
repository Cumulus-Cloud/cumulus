import { ApiError } from 'models/ApiError'

export default interface NodeDeletionState {
  loading: boolean
  error?: ApiError
}
