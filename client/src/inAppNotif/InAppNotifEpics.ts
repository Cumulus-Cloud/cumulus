import { isActionOf } from "typesafe-actions"
import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Observable } from "rxjs/Observable"
import { InAppNotifActions } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const hideInAppNotifEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(InAppNotifActions.showInAppNotif))
    .switchMap(() => Observable.of(InAppNotifActions.hideInAppNotif()).delay(3000))
}

export const hideInAppNotifEpics = combineEpics(hideInAppNotifEpic)
