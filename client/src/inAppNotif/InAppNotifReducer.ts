import { InAppNotif } from "inAppNotif/InAppNotif"
import { InAppNotifAction } from "inAppNotif/InAppNotifActions"

export interface InAppNotifState {
  inAppNotif?: InAppNotif
}

const initState: InAppNotifState = {}

export const InAppNotifReducer = (state: InAppNotifState = initState, action: InAppNotifAction) => {
  switch (action.type) {
    case "ShowInAppNotif": return { ...state, inAppNotif: action.inAppNotif }
    case "HideInAppNotif": return { ...state, inAppNotif: undefined }
    default: return state
  }
}
