import { Action } from "redux"

export interface AppAction extends Action {
  payload: any
}

export function getActionPayload<T>(action: AppAction): T {
  return action.payload
}
