import { ApiError } from 'models/ApiError'

export default interface NodeDisplacementState {
  loading: boolean
  error?: ApiError
}
