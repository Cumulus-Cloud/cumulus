import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import { loginOnSubmitSuccess, loginOnSubmitError, LOGIN_ON_SUBMIT, LOGIN_ON_SUBMIT_ERROR } from "auth/login/LoginActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

export const loginEpic: Epic<any, GlobalState> = (action$: ActionsObservable<LOGIN_ON_SUBMIT>) => action$.ofType("LOGIN_ON_SUBMIT")
    .mergeMap(action =>
      Api.authenticate(action.login, action.password)
      .then(user => {
        history.replace("/fs/")
        return loginOnSubmitSuccess(user)
      })
      .catch(loginOnSubmitError)
    )

export const loginErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<LOGIN_ON_SUBMIT_ERROR>) => {
  return action$
    .ofType("LOGIN_ON_SUBMIT_ERROR")
    .map(action => showErrorNotif(action.errors.message))
}

export const loginEpics = combineEpics(loginEpic, loginErrorEpic)
