import { User } from 'models/User'
import { AppError } from 'models/ApiError'

export default interface SignInState {
  /** True if the sign in is in progress. */
  loading: boolean
  /** If the sign in has failed. */
  error?: AppError
  /** The signed in user. */
  user?: User
}
