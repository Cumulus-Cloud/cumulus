import { Reducer, AnyAction } from 'redux'

import SnackbarState from './snackbarState'

const initialState: SnackbarState = {
  messages: []
}

const reducer: Reducer<SnackbarState> = (state: SnackbarState = initialState, action: AnyAction) => {
  switch(action.type) {
    case 'SNACKBAR/SHOW': {
      const message = { id: action.payload.id, message: action.payload.message }
      const messages = state.messages.concat([ message ])
      return { ...state, messages }
    }
    case 'SNACKBAR/HIDE': {
      const messages = state.messages.slice().filter(m => m.id !== action.payload.id)
      return { ...state, messages }
    }
    default:
      return state
  }
}

export default reducer