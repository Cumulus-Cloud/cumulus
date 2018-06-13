import { Reducer } from 'redux'

import UserState from './userState'
import { UserActions } from './userActions'

const initialState: UserState = {
  loading: false,
  connected: false
}

const reducer: Reducer<UserState, UserActions> = (state: UserState = initialState, action: UserActions) => {
  switch(action.type) {
    case 'USER/SIGN_IN':
      return { loading: true, connected: false }
    case 'USER/SIGN_IN_SUCCESS':
      return { loading: false, connected: true, user: action.payload.user }
    case 'USER/SIGN_IN_FAILURE':
      return { loading: false, connected: false, error: action.payload.error }
    case 'USER/SIGN_UP':
      return { loading: true, connected: false }
    case 'USER/SIGN_UP_SUCCESS':
      return { loading: false, connected: false, hasSignUp: true }
    case 'USER/SIGN_UP_FAILURE':
      return { loading: false, connected: false, hasSignUp: false , error: action.payload.error }
    default:
      return state
  }
}

export default reducer