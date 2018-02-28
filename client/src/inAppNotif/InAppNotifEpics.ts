import { Epic } from "redux-observable"
import { GlobalState } from "store"
import * as InAppNotifActions from "inAppNotif/InAppNotifActions"
import * as LoginActions from "auth/login/LoginActions"
import { Observable } from "rxjs/Observable"

export const apiErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("LOGIN_ON_SUBMIT_ERROR")
    .mergeMap((action: LoginActions.LOGIN_ON_SUBMIT_ERROR) =>
      Observable.of(InAppNotifActions.showInAppNotif({ type: "error", message: action.errors.message }))
    )
