import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { history } from "store"
import { Account } from "models/Account"

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
  mail: string
  password: string
}
export function signupOnSubmit(login: string, mail: string, password: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "SIGNUP_ON_SUBMIT", login, mail, password })
    Api.signup(login, mail, password).then(result => {
      dispatch(signupOnSubmitSuccess(result))
      history.replace("/fs")
    }).catch((error: Api.ApiError) => {
      if (error.type === "BadRequest") {
        dispatch(signupOnSubmitError(error.errors))
      } else {
        // TODO dispatch globa error (Toast)
      }
    })
  }
}

export type SIGNUP_ON_SUBMIT_SUCCESS = {
  type: "SIGNUP_ON_SUBMIT_SUCCESS",
  account: Account
}
export function signupOnSubmitSuccess(account: Account): SIGNUP_ON_SUBMIT_SUCCESS {
  return { type: "SIGNUP_ON_SUBMIT_SUCCESS", account }
}

export type SIGNUP_ON_SUBMIT_ERROR = {
  type: "SIGNUP_ON_SUBMIT_ERROR"
  errors: Api.FormErrors
}
export function signupOnSubmitError(errors: Api.FormErrors): SIGNUP_ON_SUBMIT_ERROR {
  return { type: "SIGNUP_ON_SUBMIT_ERROR", errors }
}
