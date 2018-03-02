import { Action } from "redux"
import { ApiError } from "services/Api"
import { User } from "models/User"

export type SignupAction =
  SignupChange |
  SignupSubmit |
  SignupSubmitSuccess |
  SignupSubmitError

export interface SignupChange extends Action {
  type: "SignupChange"
  field: string
  value: string
}
export function signupChange(field: string, value: string): SignupChange {
  return { type: "SignupChange", field, value }
}

export interface SignupSubmit extends Action {
  type: "SignupSubmit"
  login: string
  email: string
  password: string
}
export function signupSubmit(login: string, email: string, password: string): SignupSubmit {
  return { type: "SignupSubmit", login, email, password }
}

export interface SignupSubmitSuccess extends Action {
  type: "SignupSubmitSuccess"
  user: User
}
export function signupSubmitSuccess(user: User): SignupSubmitSuccess {
  return { type: "SignupSubmitSuccess", user }
}

export interface SignupSubmitError extends Action {
  type: "SignupSubmitError"
  error: ApiError
}
export function signupSubmitError(error: ApiError): SignupSubmitError {
  return { type: "SignupSubmitError", error }
}
