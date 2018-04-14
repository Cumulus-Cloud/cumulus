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
    case "LoginChange": return { ...state, [action.field]: action.value }
    case "LoginSubmit": return { ...state, loading: true, formErrors: {} }
    case "LoginSubmitError": return { ...state, formErrors: action.error, loading: false }
    case "LoginSubmitSuccess": return initState
    default: return state
  }
}
