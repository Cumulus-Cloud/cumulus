import { User } from 'models/User'
import { AppError } from 'models/ApiError'

export default interface SignUpState {
  /** True if the sign up is in progress. */
  loading: boolean
  /** If the sign up has failed. */
  error?: AppError
  /** The created user. */
  user?: User
}
