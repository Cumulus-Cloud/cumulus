import { Reducer } from 'redux'

import UserState from './userState'
import { UserActions, signIn } from './userActions'

const initialState: UserState = {
  loading: false,
  connected: false,
  signIn: {},
  signUp: {}
}

const reducer: Reducer<UserState, UserActions> = (state: UserState = initialState, action: UserActions) => {
  switch(action.type) {
    case 'USER/SIGN_IN':
      return { loading: true, connected: false, signIn: {}, signUp: {} }
    case 'USER/SIGN_IN_SUCCESS':
      return { loading: false, connected: true, signIn: { user: action.payload.user }, signUp: {} }
    case 'USER/SIGN_IN_FAILURE':
      return { loading: false, connected: false, signIn: { error: action.payload.error }, signUp: {} }
    case 'USER/SIGN_UP':
      return { loading: true, connected: false, signIn: {}, signUp: {} }
    case 'USER/SIGN_UP_SUCCESS':
      return { loading: false, connected: false, signIn: {}, signUp: { user: action.payload.user } }
    case 'USER/SIGN_UP_FAILURE':
      return { loading: false, connected: false, signIn: {}, signUp: { error: action.payload.error } }
    default:
      return state
  }
}

export default reducer