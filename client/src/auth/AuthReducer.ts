import { getType } from "typesafe-actions"
import { AuthAction, AuthActions } from "auth/AuthActions"
import { ApiError } from "models/ApiError"
import { User } from "models/User"

export interface AuthState {
  token: string
  user?: User
  login: {
    login: string
    password: string
    loading: boolean
    formErrors?: ApiError
  },
  signup: {
    login: string
    email: string
    password: string
    loading: boolean
    formErrors?: ApiError
  },
}

const initState: AuthState = {
  token: "",
  login: {
    login: "",
    password: "",
    loading: false,
  },
  signup: {
    login: "",
    email: "",
    password: "",
    loading: false,
    formErrors: undefined
  }
}

export const AuthReducer = (state: AuthState = initState, action: AuthAction) => {
  switch (action.type) {
    case getType(AuthActions.loginChange): return { ...state, login: { ...state.login, [action.payload.field]: action.payload.value } }
    case getType(AuthActions.loginSubmit): return { ...state, login: { ...state.login, loading: true, formErrors: {} } }
    case getType(AuthActions.loginSubmitError): return { ...state, login: { ...state.login, formErrors: action.payload.error, loading: false  }}
    case getType(AuthActions.loginSubmitSuccess): return {
      ...state,
      login: initState.login,
      token: action.payload.auth.token,
      user: action.payload.auth.user,
      loading: false
    }
    case getType(AuthActions.signupChange): return { ...state, signup: { ...state.signup, [action.payload.field]: action.payload.value } }
    case getType(AuthActions.signupSubmit): return { ...state, signup: { ...state.signup, loading: true, formErrors: {} } }
    case getType(AuthActions.signupSubmitError): return { ...state, signup: { ...state.signup, formErrors: action.payload.error, loading: false } }
    case getType(AuthActions.signupSubmitSuccess): return {
      ...state,
      signup: initState.signup,
      token: action.payload.auth.token,
      user: action.payload.auth.user,
      loading: false
    }
    case getType(AuthActions.logout): return initState
    default: return state
  }
}
