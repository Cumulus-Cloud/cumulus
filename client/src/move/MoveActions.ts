import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { FsNode, FsDirectory } from "models/FsNode"

export type MoveAction =
  WantMove |
  CancelMove |
  ChangeMoveTarget |
  ChangeMoveTargetSuccess |
  ChangeMoveTargetSuccessError

export type WantMove = { type: "WantMove", fsNodes: FsNode[], target: FsDirectory }
export const wantMove = (fsNodes: FsNode[], target: FsDirectory): WantMove => ({ type: "WantMove", fsNodes, target })

export type CancelMove = { type: "CancelMove" }
export const cancelMove = (): CancelMove => ({ type: "CancelMove" })

export type Move = { type: "Move" }
export const move = (): Move => ({ type: "Move" })

export type ChangeMoveTarget = { type: "ChangeMoveTarget" }
export function changeMoveTarget(path: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "ChangeMoveTarget" })
    Api.fetchDirectory(path).then(fetchedTarget => {
      dispatch(changeMoveTargetSuccess(fetchedTarget))
    }).catch(error => {
      dispatch(changeMoveTargetSuccessError(error))
    })
  }
}
export type ChangeMoveTargetSuccess = { type: "ChangeMoveTargetSuccess", target: FsDirectory }
export const changeMoveTargetSuccess = (target: FsDirectory): ChangeMoveTargetSuccess => ({ type: "ChangeMoveTargetSuccess", target })

export type ChangeMoveTargetSuccessError = { type: "ChangeMoveTargetSuccessError", error: Api.ApiError }
export const changeMoveTargetSuccessError = (error: Api.ApiError): ChangeMoveTargetSuccessError => ({
  type: "ChangeMoveTargetSuccessError",
  error
})
