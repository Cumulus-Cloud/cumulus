import { Action } from "redux"

export type AuthAction =
  LoginSubmit

export interface LoginSubmit extends Action {
  type: "LoginSubmit"
  login: string
  password: string
}
export function loginSubmit(login: string, password: string): LoginSubmit {
  return { type: "LoginSubmit", login, password }
}
