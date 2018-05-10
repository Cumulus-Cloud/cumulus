import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of, empty } from "rxjs"
import { filter, switchMap, map, catchError } from "rxjs/operators"
import { GlobalState, history, Dependencies } from "store"
import { AuthActions } from "auth/AuthActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const loginEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(AuthActions.loginSubmit)),
  switchMap(({ payload: { login, password } }) => requests.login(login, password).pipe(
    map(auth => {
      history.replace("/fs/")
      return AuthActions.loginSubmitSuccess({ auth })
    }),
    catchError((error: ApiError) => of(AuthActions.loginSubmitError({ error })))
  ))
)

export const loginErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(AuthActions.loginSubmitError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const signupEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(AuthActions.signupSubmit)),
  switchMap(({ payload: { email, login, password } }) => requests.signup(login, email, password).pipe(
    map(auth => {
      history.replace("/fs/")
      return AuthActions.signupSubmitSuccess({ auth })
    }),
    catchError((error: ApiError) => of(AuthActions.signupSubmitError({ error })))
  ))
)

export const signupErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(AuthActions.signupSubmitError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const logoutEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(AuthActions.logout)),
  switchMap(() => {
    history.replace("/login")
    return empty()
  })
)

export const authEpics = combineEpics(
  loginEpic, loginErrorEpic,
  signupEpic, signupErrorEpic,
  logoutEpic,
)
