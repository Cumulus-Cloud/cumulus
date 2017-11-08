import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
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
  mail: string
  password: string
}
export function loginOnSubmit(mail: string, password: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "LOGIN_ON_SUBMIT", mail, password })
    Api.login(mail, password).then(result => {
      dispatch(loginOnSubmitSuccess())
    }).catch((error: Api.ApiError) => {
      if (error.type === "BadRequest") {
        dispatch(loginOnSubmitError(error.errors))
      } else {
        // TODO dispatch globa error (Toast)
      }
    })
  }
}

export type LOGIN_ON_SUBMIT_SUCCESS = {
  type: "LOGIN_ON_SUBMIT_SUCCESS"
}
export function loginOnSubmitSuccess(): LOGIN_ON_SUBMIT_SUCCESS {
  return { type: "LOGIN_ON_SUBMIT_SUCCESS" }
}

export type LOGIN_ON_SUBMIT_ERROR = {
  type: "LOGIN_ON_SUBMIT_ERROR"
  errors: Api.FormErrors
}
export function loginOnSubmitError(errors: Api.FormErrors): LOGIN_ON_SUBMIT_ERROR {
  return { type: "LOGIN_ON_SUBMIT_ERROR", errors }
}
