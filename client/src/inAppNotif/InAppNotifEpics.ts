import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import { Observable } from "rxjs/Observable"
import { InAppNotifAction, hideInAppNotif } from "inAppNotif/InAppNotifActions"

export const hideInAppNotifEpic: Epic<InAppNotifAction, GlobalState> = (action$, state) => action$.ofType("ShowInAppNotif")
  .switchMap(() => Observable.of(hideInAppNotif()).delay(3000))

export const hideInAppNotifEpics = combineEpics(hideInAppNotifEpic)
