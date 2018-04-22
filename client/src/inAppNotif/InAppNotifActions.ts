import { Action } from "redux"
import { InAppNotif } from "inAppNotif/InAppNotif"
import { ApiError, getErrorMessage } from "models/ApiError"

export type InAppNotifAction = ShowInAppNotif | HideInAppNotif

export interface ShowInAppNotif extends Action {
  type: "ShowInAppNotif"
  inAppNotif: InAppNotif
}
export function showInAppNotif(inAppNotif: InAppNotif): ShowInAppNotif {
  return { type: "ShowInAppNotif", inAppNotif }
}

export function showErrorNotif(message: string): ShowInAppNotif {
  return showInAppNotif({ type: "error", message })
}

export function showApiErrorNotif(error: ApiError): ShowInAppNotif {
  const message = getErrorMessage(error)
  return showInAppNotif({ type: "error", message })
}

export function showSuccessNotif(message: string): ShowInAppNotif {
  return showInAppNotif({ type: "success", message })
}

export interface HideInAppNotif extends Action {
  type: "HideInAppNotif"
}
export function hideInAppNotif(): HideInAppNotif {
  return { type: "HideInAppNotif" }
}
