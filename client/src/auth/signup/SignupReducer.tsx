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
  formErrors: undefined
}

export const SignupReducer = (state: SignupState = initState, action: SignupAction) => {
  switch (action.type) {
    case "SignupChange": return { ...state, [action.field]: action.value }
    case "SignupSubmit": return { ...state, loading: true, formErrors: {} }
    case "SignupSubmitError": return { ...state, formErrors: action.error, loading: false }
    case "SignupSubmitSuccess": return initState
    default: return state
  }
}
