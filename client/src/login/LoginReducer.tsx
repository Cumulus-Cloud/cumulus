import { LoginAction } from "./LoginActions"
import { ApiError } from "services/Api"

export interface LoginState {
  login: string
  password: string
  loading: boolean
  formErrors?: ApiError
}

const initState: LoginState = {
  login: "",
  password: "",
  loading: false,
}

export const LoginReducer = (state: LoginState = initState, action: LoginAction) => {
  switch (action.type) {
    case "LOGIN_ON_CHANGE": {
      /*
      const formErrors = Object.keys(state.formErrors).reduce((acc, key) => {
        // TODO optimise
        if (key !== action.field) {
          return { ...acc, [key]: state.formErrors[key] }
        } else {
          return acc
        }
      }, {})
      */
      return { ...state, [action.field]: action.value, /*formErrors*/ }
    }
    case "LOGIN_ON_SUBMIT": return { ...state, loading: true, formErrors: {} }
    case "LOGIN_ON_SUBMIT_SUCCESS": return { ...state, loading: false, mail: "", password: "" }
    case "LOGIN_ON_SUBMIT_ERROR": return { ...state, formErrors: action.errors, loading: false }
    default: return state
  }
}
