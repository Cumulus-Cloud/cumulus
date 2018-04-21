import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { MiddlewareAPI } from "redux"
import { GlobalState, history, Dependencies } from "store"
import { loginOnSubmitSuccess, loginSubmitError, LoginSubmit, LoginSubmitError, LoginAction } from "auth/login/LoginActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "services/Api"
import { Observable } from "rxjs/Observable"

export const loginEpic: Epic<LoginAction, GlobalState, Dependencies> = (
  action$: ActionsObservable<LoginSubmit>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("LoginSubmit")
    .concatMap(({ login, password }) =>
      dependencies.requests.login()(login, password)
        .map(() => {
          history.replace("/fs/")
          return loginOnSubmitSuccess()
        })
        .catch((error: ApiError) => Observable.of(loginSubmitError(error)))
    )
}

export const loginErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<LoginSubmitError>) => {
  return action$
    .ofType("LoginSubmitError")
    .map(action => showApiErrorNotif(action.error))
}

export const loginEpics = combineEpics<LoginAction, GlobalState, Dependencies>(loginEpic, loginErrorEpic)
