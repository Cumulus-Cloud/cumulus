import { Action } from "redux"
import { ApiError } from "services/Api"

export type AuthAction =
  LoginSubmit |
  LoginSubmitError |
  LoginSubmitSuccess |
  LoginChange

export interface LoginSubmit extends Action {
  type: "LoginSubmit"
  login: string
  password: string
}
export function loginSubmit(login: string, password: string): LoginSubmit {
  return { type: "LoginSubmit", login, password }
}

export interface LoginSubmitSuccess extends Action {
  type: "LoginSubmitSuccess"
}
export function loginOnSubmitSuccess(): LoginSubmitSuccess {
  return { type: "LoginSubmitSuccess" }
}

export interface LoginSubmitError extends Action {
  type: "LoginSubmitError"
  error: ApiError
}
export function loginSubmitError(error: ApiError): LoginSubmitError {
  return { type: "LoginSubmitError", error }
}

export interface LoginChange extends Action {
  type: "LoginChange"
  field: string
  value: string
}
export function loginChange(field: string, value: string): LoginChange {
  return { type: "LoginChange", field, value }
}
