import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import { SignupSubmit, signupSubmitSuccess, signupSubmitError, SignupSubmitError, SignupAction } from "auth/signup/SignupActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const signupEpic: Epic<SignupAction, GlobalState> = (action$: ActionsObservable<SignupSubmit>) => action$.ofType("SignupSubmit")
    .mergeMap(action =>
      Api.signup(action.login, action.email, action.password)
      .then(user => {
        history.replace("/fs/")
        return signupSubmitSuccess()
      })
      .catch(signupSubmitError)
    )

export const signupErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<SignupSubmitError>) => {
  return action$
    .ofType("SignupSubmitError")
    .map((action: SignupSubmitError) => showApiErrorNotif(action.error))
}

export const signupEpics = combineEpics(signupEpic, signupErrorEpic)
