import { Action } from "redux"

export interface AuthState {
  token: string
}

const initState: AuthState = {
  token: ""
}

export const AuthReducer = (state: AuthState = initState, action: Action) => {
  switch (action.type) {
    default: return state
  }
}
