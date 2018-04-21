import { Action } from "redux"
import { ApiError } from "services/Api"

export type AuthAction =
  LoginChange |
  LoginSubmit |
  LoginSubmitError |
  LoginSubmitSuccess |
  SignupChange |
  SignupSubmit |
  SignupSubmitSuccess |
  SignupSubmitError

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
}
export function signupSubmitSuccess(): SignupSubmitSuccess {
  return { type: "SignupSubmitSuccess" }
}

export interface SignupSubmitError extends Action {
  type: "SignupSubmitError"
  error: ApiError
}
export function signupSubmitError(error: ApiError): SignupSubmitError {
  return { type: "SignupSubmitError", error }
}
