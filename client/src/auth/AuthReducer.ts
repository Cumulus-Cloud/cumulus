import { ApiError } from "services/Api"
import { AuthAction } from "auth/AuthActions"

export interface AuthState {
  token: string
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
  }
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
    case "LoginChange": return { ...state, login: { ...state.login, [action.field]: action.value } }
    case "LoginSubmit": return { ...state, login: { ...state.login, loading: true, formErrors: {} } }
    case "LoginSubmitError": return { ...state, login: { ...state.login, formErrors: action.error, loading: false  }}
    case "LoginSubmitSuccess": return { ...state, login: initState.login }
    case "SignupChange": return { ...state, signup: { ...state.signup, [action.field]: action.value } }
    case "SignupSubmit": return { ...state, signup: { ...state.signup, loading: true, formErrors: {} } }
    case "SignupSubmitError": return { ...state, signup: { ...state.signup, formErrors: action.error, loading: false } }
    case "SignupSubmitSuccess": return { ...state, signup: initState.signup }
    default: return state
  }
}
