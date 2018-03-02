import { Epic, combineEpics } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import * as SignupActions from "auth/signup/SignupActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const signupEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("SIGNUP_ON_SUBMIT")
    .mergeMap((action: SignupActions.SIGNUP_ON_SUBMIT) =>
      Api.signup(action.login, action.email, action.password)
      .then(user => {
        history.replace("/fs/")
        return SignupActions.signupOnSubmitSuccess(user)
      })
      .catch(SignupActions.signupOnSubmitError)
    )

export const signupErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("SIGNUP_ON_SUBMIT_ERROR")
    .map((action: SignupActions.SIGNUP_ON_SUBMIT_ERROR) => showApiErrorNotif(action.errors))

export const signupEpics = combineEpics(signupEpic, signupErrorEpic)
