import { Epic, combineEpics } from "redux-observable"
import { GlobalState, history } from "store"
import * as Api from "services/Api"
import * as LoginActions from "auth/login/LoginActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

// tslint:disable-next-line:no-any
export const loginEpic: Epic<any, GlobalState> = (action$) => action$.ofType("LOGIN_ON_SUBMIT")
    .mergeMap((action: LoginActions.LOGIN_ON_SUBMIT) =>
      Api.authenticate(action.login, action.password)
      .then(user => {
        history.replace("/fs/")
        return LoginActions.loginOnSubmitSuccess(user)
      })
      .catch(LoginActions.loginOnSubmitError)
    )

// tslint:disable-next-line:no-any
export const loginErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("LOGIN_ON_SUBMIT_ERROR")
    .map((action: LoginActions.LOGIN_ON_SUBMIT_ERROR) => showErrorNotif(action.errors.message))

export const loginEpics = combineEpics(loginEpic, loginErrorEpic)
