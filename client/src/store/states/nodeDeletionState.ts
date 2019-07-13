import { AppError } from 'models/ApiError'

export default interface NodeDeletionState {
  loading: boolean
  error?: AppError
}
