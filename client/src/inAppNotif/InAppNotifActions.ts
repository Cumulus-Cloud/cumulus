import { InAppNotif } from "inAppNotif/InAppNotif"
import { ApiError } from "services/Api"

export type InAppNotifAction = ShowInAppNotif | HideInAppNotif

export type ShowInAppNotif = { type: "ShowInAppNotif", inAppNotif: InAppNotif }
export const showInAppNotif = (inAppNotif: InAppNotif): ShowInAppNotif => ({ type: "ShowInAppNotif", inAppNotif })

export function showErrorNotif(message: string): ShowInAppNotif {
  return showInAppNotif({ type: "error", message })
}

export function showApiErrorNotif(error: ApiError): ShowInAppNotif {
  const firstKey = Object.keys(error.errors).pop()
  if (firstKey && error.errors[firstKey].length > 0) {
    const message = error.errors[firstKey][0].message
    return showInAppNotif({ type: "error", message })
  } else {
    const message = error.message
    return showInAppNotif({ type: "error", message })
  }
}

export function showSuccessNotif(message: string): ShowInAppNotif {
  return showInAppNotif({ type: "success", message })
}

export type HideInAppNotif = { type: "HideInAppNotif" }
export const hideInAppNotif = (): HideInAppNotif => ({ type: "HideInAppNotif" })
