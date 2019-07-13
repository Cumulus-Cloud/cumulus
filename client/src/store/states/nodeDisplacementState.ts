import { AppError } from 'models/ApiError'

export default interface NodeDisplacementState {
  loading: boolean
  error?: AppError
}
