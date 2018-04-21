import { Action } from "redux"
import { ApiError } from "services/Api"
import { AuthApiResponse } from "models/AuthApiResponse"

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
  auth: AuthApiResponse
}
export function loginOnSubmitSuccess(auth: AuthApiResponse): LoginSubmitSuccess {
  return { type: "LoginSubmitSuccess", auth }
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
  auth: AuthApiResponse
}
export function signupSubmitSuccess(auth: AuthApiResponse): SignupSubmitSuccess {
  return { type: "SignupSubmitSuccess", auth }
}

export interface SignupSubmitError extends Action {
  type: "SignupSubmitError"
  error: ApiError
}
export function signupSubmitError(error: ApiError): SignupSubmitError {
  return { type: "SignupSubmitError", error }
}
