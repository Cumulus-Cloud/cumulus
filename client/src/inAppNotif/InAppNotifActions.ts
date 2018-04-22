import { buildAction, ActionsUnion } from "typesafe-actions"
import { InAppNotif } from "inAppNotif/InAppNotif"
import { ApiError, getErrorMessage } from "models/ApiError"

export const InAppNotifActions = {
  showInAppNotif: buildAction("ShowInAppNotif").payload<{ inAppNotif: InAppNotif }>(),
  hideInAppNotif: buildAction("HideInAppNotif").empty(),
}

export type InAppNotifAction = ActionsUnion<typeof InAppNotifActions>

export function showErrorNotif(message: string) {
  return InAppNotifActions.showInAppNotif({ inAppNotif: { type: "error", message } })
}

export function showApiErrorNotif(error: ApiError) {
  const message = getErrorMessage(error)
  return InAppNotifActions.showInAppNotif({ inAppNotif: { type: "error", message } })
}

export function showSuccessNotif(message: string) {
  return InAppNotifActions.showInAppNotif({ inAppNotif: { type: "success", message } })
}
