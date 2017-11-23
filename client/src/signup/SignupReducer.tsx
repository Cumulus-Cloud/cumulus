import { SignupAction } from "signup/SignupActions"
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
    case "SIGNUP_ON_CHANGE": {
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
    case "SIGNUP_ON_SUBMIT": return { ...state, loading: true, formErrors: {} }
    case "SIGNUP_ON_SUBMIT_SUCCESS": return { ...state, loading: false, login: "", email: "", password: "" }
    case "SIGNUP_ON_SUBMIT_ERROR": return { ...state, formErrors: action.errors, loading: false }
    default: return state
  }
}
