import { SignupAction } from "./SignupActions"
import { ApiError } from "services/Api"

export interface SignupState {
  login: string
  email: string
  password: string
  loading: boolean
  formErrors?: ApiError
}

const initState: SignupState = {
  login: "",
  email: "",
  password: "",
  loading: false,
}

export const SignupReducer = (state: SignupState = initState, action: SignupAction) => {
  switch (action.type) {
    case "SignupChange": return { ...state, [action.field]: action.value }
    case "SignupSubmit": return { ...state, loading: true, formErrors: {} }
    case "SignupSubmitSuccess": return { ...state, loading: false, login: "", email: "", password: "" }
    case "SignupSubmitError": return { ...state, formErrors: action.error, loading: false }
    default: return state
  }
}
