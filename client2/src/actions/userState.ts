import { ApiError } from '../models/ApiError'
import { User } from '../models/User'

export default interface UserState {
  loading: Boolean
  connected: Boolean
  hasSignUp?: Boolean
  error?: ApiError
  user?: User
}
