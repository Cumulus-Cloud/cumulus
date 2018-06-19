import { Reducer } from 'redux'

import AuthenticationState from './authenticationState'
import { AuthenticationActions } from './authenticationActions'

const initialState: AuthenticationState = {
  loading: true, // We start at true to avoid trying to load the app before the auth check
  connected: false
}

const reducer: Reducer<AuthenticationState, AuthenticationActions> = (state: AuthenticationState = initialState, action: AuthenticationActions) => {
  switch(action.type) {
    case 'USER/AUTH/TEST_SIGNED_IN':
      return { loading: true, connected: false }
    case 'USER/AUTH/SIGNED_IN':
      console.info("User already signed in")
      return { loading: false, connected: true, user: action.payload.user }
    case 'USER/AUTH/NOT_SIGNED_IN':
      console.info("User not already signed in")
      return { loading: false, connected: false }
    default:
      return state
  }
}

export default reducer
