import { getType } from "typesafe-actions"
import { InAppNotif } from "inAppNotif/InAppNotif"
import { InAppNotifActions } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"

export interface InAppNotifState {
  inAppNotif?: InAppNotif
}

const initState: InAppNotifState = {}

export const InAppNotifReducer = (state: InAppNotifState = initState, action: Actions): InAppNotifState => {
  switch (action.type) {
    case getType(InAppNotifActions.showInAppNotif): return { ...state, inAppNotif: action.payload.inAppNotif }
    case getType(InAppNotifActions.hideInAppNotif): return { ...state, inAppNotif: undefined }
    default: return state
  }
}
