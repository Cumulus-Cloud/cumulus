import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { MiddlewareAPI } from "redux"
import { GlobalState, history, Dependencies } from "store"
import {
  loginOnSubmitSuccess, loginSubmitError, LoginSubmit, LoginSubmitError, SignupSubmit,
  signupSubmitSuccess, signupSubmitError, SignupSubmitError, Logout
} from "auth/AuthActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const loginEpic: EpicType = (
  action$: ActionsObservable<LoginSubmit>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("LoginSubmit")
    .concatMap(({ login, password }) =>
      dependencies.requests.login(login, password)
        .map(auth => {
          history.replace("/fs/")
          return loginOnSubmitSuccess(auth)
        })
        .catch((error: ApiError) => Observable.of(loginSubmitError(error)))
    )
}

export const loginErrorEpic: EpicType = (action$: ActionsObservable<LoginSubmitError>) => {
  return action$
    .ofType("LoginSubmitError")
    .map(action => showApiErrorNotif(action.error))
}

export const signupEpic: EpicType = (
  action$: ActionsObservable<SignupSubmit>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("SignupSubmit")
    .concatMap(({ email, login, password }) =>
      dependencies.requests.signup(login, email, password)
      .map(auth => {
        history.replace("/fs/")
        return signupSubmitSuccess(auth)
      })
      .catch((error: ApiError) => Observable.of(signupSubmitError(error)))
    )
}

export const signupErrorEpic: EpicType = (action$: ActionsObservable<SignupSubmitError>) => {
  return action$
    .ofType("SignupSubmitError")
    .map((action: SignupSubmitError) => showApiErrorNotif(action.error))
}

export const logoutEpic: EpicType = (action$: ActionsObservable<Logout>) => {
  return action$
    .ofType("Logout")
    .mergeMap(() => {
      history.replace("/login")
      return Observable.empty<Actions>()
    })
}

export const authEpics = combineEpics(
  loginEpic, loginErrorEpic,
  signupEpic, signupErrorEpic,
  logoutEpic,
)
