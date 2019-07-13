import Api from 'services/api'

import { ContextState } from 'utils/store'

import { State } from 'store/store'

import { ApiList } from 'models/utils'
import { AppError } from 'models/ApiError'
import { Event } from 'models/Event'


export const getEvents = ({ setState, getState }: ContextState<State>) => () => {
  // Prepare the loading
  setState(state => ({
    events: {
      ...state.events,
      loading: true,
      error: undefined
    }
  }))

  const state = getState()
  const offset = state.events.events ? state.events.events.length : 0

  return Api.user.events.all(offset)
    .then((result: ApiList<Event>) => {
      setState(state => ({
        events: {
          ...state.events,
          loading: false,
          events: (state.events.events || []).concat(result.items),
          hasMore: result.hasMore,
          error: undefined
        }
      }))
    })
    .catch((e: AppError) => {
      setState(state => ({
        events: {
          ...state.events,
          loading: false,
          error: e
        }
      }))
    })

}
