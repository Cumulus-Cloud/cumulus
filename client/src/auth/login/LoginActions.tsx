import { User } from "models/User"
import { ApiError } from "services/Api"
import { Action } from "redux"

export type LoginAction =
  LoginChange |
  LoginSubmit |
  LoginSubmitError |
  LoginSubmitSuccess

export interface LoginChange extends Action {
  type: "LoginChange"
  field: string
  value: string
}
export function loginChange(field: string, value: string): LoginChange {
  return { type: "LoginChange", field, value }
}

export interface LoginSubmit extends Action {
  type: "LoginSubmit"
  login: string
  password: string
}
export const loginSubmit = (login: string, password: string): LoginSubmit => ({ type: "LoginSubmit", login, password })

export interface LoginSubmitSuccess extends Action {
  type: "LoginSubmitSuccess"
  user: User
}
export function loginOnSubmitSuccess(user: User): LoginSubmitSuccess {
  return { type: "LoginSubmitSuccess", user }
}

export interface LoginSubmitError extends Action {
  type: "LoginSubmitError"
  error: ApiError
}
export function loginSubmitError(error: ApiError): LoginSubmitError {
  return { type: "LoginSubmitError", error }
}
