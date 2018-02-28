import { Epic, combineEpics } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import * as SignupActions from "auth/signup/SignupActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

// tslint:disable-next-line:no-any
export const signupEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("LOGIN_ON_SUBMIT")
    .mergeMap(action =>
      Api.authenticate(action.login, action.password)
      .then(user => {
        history.replace("/fs/")
        return SignupActions.signupOnSubmitSuccess(user)
      })
      .catch(SignupActions.signupOnSubmitError)
    )

// tslint:disable-next-line:no-any
export const signupErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("SIGNUP_ON_SUBMIT_ERROR")
    .map((action: SignupActions.SIGNUP_ON_SUBMIT_ERROR) => showErrorNotif(action.errors.message))

export const signupEpics = combineEpics(signupEpic, signupErrorEpic)
