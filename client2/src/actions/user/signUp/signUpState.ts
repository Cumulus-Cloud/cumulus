import { User } from '../../../models/User'
import { ApiError } from '../../../models/ApiError'

export default interface SignUpState {
  /** True if the sign up is in progress. */
  loading: Boolean
  /** If the sign up has failed. */
  error?: ApiError
  /** The created user. */
  user?: User
}
