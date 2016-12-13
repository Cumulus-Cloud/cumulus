import { Action } from "redux"

const ADD_AUTH_TOKEN: string = "ADD_AUTH_TOKEN"

function addAuthToken(token: string) {
  return {
    type: ADD_AUTH_TOKEN,
    token
  }
}

export interface AppState {
  token?: string
}

const initAppState: AppState = {
}

export interface AppStateAction extends Action {
  token: string
}

export function appReducer(state: AppState = initAppState, action: Action) {
  switch (action.type) {
    case ADD_AUTH_TOKEN:
      const token: string = (action as AppStateAction).token
      const newState = { token }
      return { ...state, ...newState }
    default:
      return state
  }
}
