import { ApiError } from "services/Api"
import { User } from "models/User"

export type SignupAction =
  SIGNUP_ON_CHANGE |
  SIGNUP_ON_SUBMIT |
  SIGNUP_ON_SUBMIT_ERROR |
  SIGNUP_ON_SUBMIT_SUCCESS

export type SIGNUP_ON_CHANGE = {
  type: "SIGNUP_ON_CHANGE"
  field: string
  value: string
}
export function signupOnChange(field: string, value: string): SIGNUP_ON_CHANGE {
  return { type: "SIGNUP_ON_CHANGE", field, value }
}

export type SIGNUP_ON_SUBMIT = {
  type: "SIGNUP_ON_SUBMIT"
  login: string
  email: string
  password: string
}
export function signupOnSubmit(login: string, email: string, password: string): SIGNUP_ON_SUBMIT {
  return { type: "SIGNUP_ON_SUBMIT", login, email, password }
}

export type SIGNUP_ON_SUBMIT_SUCCESS = {
  type: "SIGNUP_ON_SUBMIT_SUCCESS",
  user: User
}
export function signupOnSubmitSuccess(user: User): SIGNUP_ON_SUBMIT_SUCCESS {
  return { type: "SIGNUP_ON_SUBMIT_SUCCESS", user }
}

export type SIGNUP_ON_SUBMIT_ERROR = {
  type: "SIGNUP_ON_SUBMIT_ERROR"
  errors: ApiError
}
export function signupOnSubmitError(errors: ApiError): SIGNUP_ON_SUBMIT_ERROR {
  return { type: "SIGNUP_ON_SUBMIT_ERROR", errors }
}
