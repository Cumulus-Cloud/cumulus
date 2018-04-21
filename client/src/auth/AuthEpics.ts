import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { MiddlewareAPI } from "redux"
import { GlobalState, history, Dependencies } from "store"
import {
  loginOnSubmitSuccess, loginSubmitError, LoginSubmit, LoginSubmitError, SignupSubmit,
  signupSubmitSuccess, signupSubmitError, SignupSubmitError, AuthAction
} from "auth/AuthActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "services/Api"
import { Observable } from "rxjs/Observable"
import { Actions } from "actions"

export const loginEpic: Epic<Actions, GlobalState, Dependencies> = (
  action$: ActionsObservable<LoginSubmit>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("LoginSubmit")
    .concatMap(({ login, password }) =>
      dependencies.requests.login(login, password)
        .map(() => {
          history.replace("/fs/")
          return loginOnSubmitSuccess()
        })
        .catch((error: ApiError) => Observable.of(loginSubmitError(error)))
    )
}

export const loginErrorEpic: Epic<Actions, GlobalState> = (action$: ActionsObservable<LoginSubmitError>) => {
  return action$
    .ofType("LoginSubmitError")
    .map(action => showApiErrorNotif(action.error))
}

export const signupEpic: Epic<AuthAction, GlobalState, Dependencies> = (
  action$: ActionsObservable<SignupSubmit>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("SignupSubmit")
    .concatMap(({ email, login, password }) =>
      dependencies.requests.signup(login, email, password)
      .map(() => {
        history.replace("/fs/")
        return signupSubmitSuccess()
      })
      .catch((error: ApiError) => Observable.of(signupSubmitError(error)))
    )
}

export const signupErrorEpic: Epic<Actions, GlobalState> = (action$: ActionsObservable<SignupSubmitError>) => {
  return action$
    .ofType("SignupSubmitError")
    .map((action: SignupSubmitError) => showApiErrorNotif(action.error))
}

export const authEpics = combineEpics<Actions, GlobalState, Dependencies>(
  loginEpic, loginErrorEpic,
  signupEpic, signupErrorEpic,
)
