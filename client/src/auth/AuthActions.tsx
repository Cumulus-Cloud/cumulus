import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { Login } from "./AuthReducer"
import * as Api from "../services/Api"

export type AuthAction =
  LOGIN_ON_CHANGE |
  LOGIN_ON_SUBMIT |
  LOGIN_ON_SUBMIT_SUCCESS |
  LOGIN_ON_SUBMIT_ERROR

export type LOGIN_ON_CHANGE = {
  type: "LOGIN_ON_CHANGE"
  field: string
  value: string
}
export function loginOnChange(field: string, value: string) {
  return { type: "LOGIN_ON_CHANGE", field, value }
}

export type LOGIN_ON_SUBMIT = {
  type: "LOGIN_ON_SUBMIT"
  email: string
  password: string
}
export function loginOnSubmit(login: Login): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "LOGIN_ON_SUBMIT", email: login.email, password: login.password })
    Api.login(login.email, login.password).then(result => {
      dispatch(loginOnSubmitSuccess())
    }).catch(error => {
      dispatch(loginOnSubmitError(error))
    })
  }
}

export type LOGIN_ON_SUBMIT_SUCCESS = {
  type: "LOGIN_ON_SUBMIT_SUCCESS"
}
export function loginOnSubmitSuccess() {
  return { type: "LOGIN_ON_SUBMIT_SUCCESS" }
}

export type LOGIN_ON_SUBMIT_ERROR = {
  type: "LOGIN_ON_SUBMIT_ERROR"
  error: any
}
export function loginOnSubmitError(error: any) {
  return { type: "LOGIN_ON_SUBMIT_ERROR", error }
}
