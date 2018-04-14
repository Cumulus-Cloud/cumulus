import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import { loginOnSubmitSuccess, loginSubmitError, LoginSubmit, LoginSubmitError, LoginAction } from "auth/login/LoginActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const loginEpic: Epic<LoginAction, GlobalState> = (action$: ActionsObservable<LoginSubmit>) => action$.ofType("LoginSubmit")
    .mergeMap(action =>
      Api.authenticate(action.login, action.password)
      .then(user => {
        history.replace("/fs/")
        return loginOnSubmitSuccess()
      })
      .catch(loginSubmitError)
    )

export const loginErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<LoginSubmitError>) => {
  return action$
    .ofType("LoginSubmitError")
    .map(action => showApiErrorNotif(action.error))
}

export const loginEpics = combineEpics(loginEpic, loginErrorEpic)
