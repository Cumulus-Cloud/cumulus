import { store } from "store"
import * as InAppNotifActions from "inAppNotif/InAppNotifActions"
import { InAppNotif } from "inAppNotif/InAppNotif"

let timeoutId: NodeJS.Timer | undefined

const timeout = 3000

export function showSuccessNotif(message: string) {
  show({ type: "success", message })
}

export function showErrorNotif(message: string) {
  show({ type: "error", message })
}

function show(inAppNotif: InAppNotif) {
  clear()
  store.dispatch(InAppNotifActions.showInAppNotif(inAppNotif))
  timeoutId = setTimeout(() => {
    store.dispatch(InAppNotifActions.hideInAppNotif())
  }, timeout)
}

function clear() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }
}
