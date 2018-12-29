import Api from 'services/api'

import { ApiList } from 'models/utils'
import { ApiError } from 'models/ApiError'
import { Event } from 'models/Event'

import { createPureAction } from 'store/actions'

export const getEvents = createPureAction((setState, getState) => {
  // Prepare the loading
  setState(state => ({
    events: {
      ...state.events,
      loading: true,
      error: undefined
    }
  }))

  const state = getState()
  const offset = state.fs.content ? state.fs.content.length : 0

  return Api.user.events.all(offset).then((result: ApiError | ApiList<Event>) => {
    if ('errors' in result) {
      setState(state => ({
        events: {
          ...state.events,
          loading: false,
          error: result
        }
      }))
    } else {
      console.log(result)
      setState(state => ({
        events: {
          ...state.events,
          loading: false,
          events: (state.events.events || []).concat(result.items),
          hasMore: result.hasMore,
          error: undefined
        }
      }))
    }
  })

})
