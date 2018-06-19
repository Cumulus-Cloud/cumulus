import { Reducer } from 'redux'

import SignUpState from './signUpState'
import { SignUpActions } from './signUpActions'

const initialState: SignUpState = {
  loading: false
}

const reducer: Reducer<SignUpState, SignUpActions> = (state: SignUpState = initialState, action: SignUpActions) => {
  switch(action.type) {
    case 'USER/SIGN_UP':
      return { loading: true, connected: false }
    case 'USER/SIGN_UP/SUCCESS':
      return { loading: false, connected: false, user: action.payload.user }
    case 'USER/SIGN_UP/FAILURE':
      return { loading: false, connected: false, error: action.payload.error }
    default:
      return state
  }
}

export default reducer
