import { ApiError } from '../../models/ApiError'
import { User } from '../../models/User'

export default interface UserState {
  loading: Boolean
  connected: Boolean
  signIn: {
    error?: ApiError
    user?: User
  }
  signUp: {
    error?: ApiError
    user?: User
  }
}
