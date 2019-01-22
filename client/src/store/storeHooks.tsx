
import AuthenticationState, { initialState as initialAuthState } from 'store/states/authenticationState'
import SignInState from 'store/states/signInState'
import SignUpState from 'store/states/signUpState'

export type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
}

export const initialState: State = {
  auth: initialAuthState(),
  signIn: { loading: false },
  signUp: { loading: false }
}

import React from 'react'

export interface Dispatcher<S> {
  update: React.Dispatch<S>
}

export function createStore<T>(initialState: T): [ React.Context<T & Dispatcher<T>>, React.FunctionComponent ] {
  const Context = React.createContext<T & Dispatcher<T>>({ ...initialState, update: s => s })
  const Provider: React.FunctionComponent = ({ children }) => {
    const [state, setState] = React.useState(initialState)
    return (
      <Context.Provider value={{ ...state, update: setState }}>{children}</Context.Provider>
    )
  }

  return [Context, Provider]
}

export const [ AppContext, AppProvider ] = createStore(initialState)
