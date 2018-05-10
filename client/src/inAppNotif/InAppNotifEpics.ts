import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, switchMap, delay } from "rxjs/operators"
import { GlobalState, Dependencies } from "store"
import { InAppNotifActions } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const hideInAppNotifEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(InAppNotifActions.showInAppNotif)),
  switchMap(() => of(InAppNotifActions.hideInAppNotif()).pipe(
    delay(3000)
  ))
)

export const hideInAppNotifEpics = combineEpics(hideInAppNotifEpic)
