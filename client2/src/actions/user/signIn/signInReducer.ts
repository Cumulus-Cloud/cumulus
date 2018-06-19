import { Reducer } from 'redux'

import SignInState from './signInState'
import { SignInActions } from './signInActions'

const initialState: SignInState = {
  loading: false
}

const reducer: Reducer<SignInState, SignInActions> = (state: SignInState = initialState, action: SignInActions) => {
  switch(action.type) {
    case 'USER/SIGN_IN':
      return { loading: true }
    case 'USER/SIGN_IN/SUCCESS':
      return { loading: false, user: action.payload.user }
    case 'USER/SIGN_IN/FAILURE':
      return { loading: false, error: action.payload.error }
    default:
      return state
  }
}

export default reducer
