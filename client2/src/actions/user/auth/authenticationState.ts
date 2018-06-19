import { User } from '../../../models/User'

export default interface AuthenticationState {
  /** True if the auhentication is in progress. */
  loading: Boolean
  /** If the user is connected or not. */
  connected: Boolean
  /** The connected user. */
  user?: User
}
