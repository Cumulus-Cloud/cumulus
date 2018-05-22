import { createAction, ActionType } from "typesafe-actions"

import { InAppNotif } from "inAppNotif/InAppNotif"
import { ApiError, getErrorMessage } from "models/ApiError"

export const InAppNotifActions = {
  showInAppNotif: createAction("ShowInAppNotif", resolve => (inAppNotif: InAppNotif) => resolve({ inAppNotif })),
  hideInAppNotif: createAction("HideInAppNotif"),
}

export type InAppNotifAction = ActionType<typeof InAppNotifActions>

export function showErrorNotif(message: string) {
  return InAppNotifActions.showInAppNotif({ type: "error", message })
}

export function showApiErrorNotif(error: ApiError) {
  const message = getErrorMessage(error)
  return InAppNotifActions.showInAppNotif({ type: "error", message })
}

export function showSuccessNotif(message: string) {
  return InAppNotifActions.showInAppNotif({ type: "success", message })
}
