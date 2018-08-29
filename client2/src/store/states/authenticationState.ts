import { User } from 'models/User'

export default interface AuthenticationState {
  /** True if the auhentication is in progress. */
  loading: boolean
  /** If the user is connected or not. */
  connected: boolean
  /** The connected user. */
  user?: User
}
