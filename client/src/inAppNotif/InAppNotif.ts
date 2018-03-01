
export type InAppNotifType = "error" | "success"

export interface InAppNotif {
  type: InAppNotifType
  message: string
}
