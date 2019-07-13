import { AppError } from 'models/ApiError'
import { Event } from 'models/Event'

export default interface EventState {
  /** If events are being loaded. */
  loading: boolean
  /** Loaded events. */
  events?: Event[]
  /** If more events can be loaded. */
  hasMore: boolean
  /** If the sign in has failed. */
  error?: AppError
}
