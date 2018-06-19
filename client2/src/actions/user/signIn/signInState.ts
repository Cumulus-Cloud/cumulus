import { User } from '../../../models/User'
import { ApiError } from '../../../models/ApiError'

export default interface SignInState {
  /** True if the sign in is in progress. */
  loading: Boolean
  /** If the sign in has failed. */
  error?: ApiError
  /** The signed in user. */
  user?: User
}
