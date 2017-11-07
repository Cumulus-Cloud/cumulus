import { AuthAction } from "./AuthActions"

export interface Login {
  email: string
  password: string
}

export interface AuthState {
  login: Login
  loading: boolean
  error?: any
}

const initState: AuthState = {
  login: {
    email: "",
    password: "",
  },
  loading: false,
  error: undefined,
}

export const AuthReducer = (state: AuthState = initState, action: AuthAction) => {
  switch (action.type) {
    case "LOGIN_ON_CHANGE": {
      const login = { ...state.login, [action.field]: action.value }
      return { ...state, login }
    }
    case "LOGIN_ON_SUBMIT": return { ...state, loading: true, error: undefined }
    case "LOGIN_ON_SUBMIT_SUCCESS": return { ...state, loading: false, email: "", password: "" }
    case "LOGIN_ON_SUBMIT_ERROR": return { ...state, error: action.error, loading: false }
    default: return state
  }
}
