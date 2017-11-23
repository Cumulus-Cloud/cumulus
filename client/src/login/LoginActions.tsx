import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { history } from "store"
import { User } from "models/User"
import * as Api from "services/Api"

export type LoginAction =
  LOGIN_ON_CHANGE |
  LOGIN_ON_SUBMIT |
  LOGIN_ON_SUBMIT_ERROR |
  LOGIN_ON_SUBMIT_SUCCESS

export type LOGIN_ON_CHANGE = {
  type: "LOGIN_ON_CHANGE"
  field: string
  value: string
}
export function loginOnChange(field: string, value: string): LOGIN_ON_CHANGE {
  return { type: "LOGIN_ON_CHANGE", field, value }
}

export type LOGIN_ON_SUBMIT = {
  type: "LOGIN_ON_SUBMIT"
  login: string
  password: string
}
export function loginOnSubmit(login: string, password: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "LOGIN_ON_SUBMIT", login, password })
    Api.login(login, password).then(result => {
      dispatch(loginOnSubmitSuccess(result))
      history.replace("/fs/")
    }).catch((error: Api.ApiError) => dispatch(loginOnSubmitError(error)))
  }
}

export type LOGIN_ON_SUBMIT_SUCCESS = {
  type: "LOGIN_ON_SUBMIT_SUCCESS",
  user: User
}
export function loginOnSubmitSuccess(user: User): LOGIN_ON_SUBMIT_SUCCESS {
  return { type: "LOGIN_ON_SUBMIT_SUCCESS", user }
}

export type LOGIN_ON_SUBMIT_ERROR = {
  type: "LOGIN_ON_SUBMIT_ERROR"
  errors: Api.ApiError
}
export function loginOnSubmitError(errors: Api.ApiError): LOGIN_ON_SUBMIT_ERROR {
  return { type: "LOGIN_ON_SUBMIT_ERROR", errors }
}
