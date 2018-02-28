import { InAppNotif } from "inAppNotif/InAppNotif"

export type InAppNotifAction = ShowInAppNotif | HideInAppNotif

export type ShowInAppNotif = { type: "ShowInAppNotif", inAppNotif: InAppNotif }
export const showInAppNotif = (inAppNotif: InAppNotif): ShowInAppNotif => ({ type: "ShowInAppNotif", inAppNotif })

export type HideInAppNotif = { type: "HideInAppNotif" }
export const hideInAppNotif = (): HideInAppNotif => ({ type: "HideInAppNotif" })
