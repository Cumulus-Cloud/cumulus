import { Epic, combineEpics } from "redux-observable"
import { GlobalState, history, Dependencies } from "store"
import { isActionOf } from "typesafe-actions"
import { AuthActions } from "auth/AuthActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const loginEpic: EpicType = (action$, store, dependencies) => {
  return action$.filter(isActionOf(AuthActions.loginSubmit))
    .concatMap(({ payload: { login, password } }) =>
      dependencies.requests.login(login, password)
        .map(auth => {
          history.replace("/fs/")
          return AuthActions.loginSubmitSuccess({ auth })
        })
        .catch((error: ApiError) => Observable.of(AuthActions.loginSubmitError({ error })))
    )
}

export const loginErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(AuthActions.loginSubmitError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const signupEpic: EpicType = (action$, store, dependencies) => {
  return action$
    .filter(isActionOf(AuthActions.signupSubmit))
    .concatMap(({ payload: { email, login, password } }) =>
      dependencies.requests.signup(login, email, password)
      .map(auth => {
        history.replace("/fs/")
        return AuthActions.signupSubmitSuccess({ auth })
      })
      .catch((error: ApiError) => Observable.of(AuthActions.signupSubmitError({ error })))
    )
}

export const signupErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(AuthActions.signupSubmitError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const logoutEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(AuthActions.logout))
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
