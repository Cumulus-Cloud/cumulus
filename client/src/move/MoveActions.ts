import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { FsNode, FsDirectory } from "models/FsNode"

export type MoveAction =
  WantMove |
  CancelMove |
  ChangeMoveTarget |
  ChangeMoveTargetSuccess |
  ChangeMoveTargetError |
  Move |
  MoveSuccess |
  MoveError

export type WantMove = { type: "WantMove", fsNodes: FsNode[], target: FsDirectory }
export const wantMove = (fsNodes: FsNode[], target: FsDirectory): WantMove => ({ type: "WantMove", fsNodes, target })

export type CancelMove = { type: "CancelMove" }
export const cancelMove = (): CancelMove => ({ type: "CancelMove" })

export type Move = { type: "Move" }
export function move(): ThunkAction<void, GlobalState, {}> {
  return (dispatch, getState) => {
    dispatch({ type: "Move" })
    const state = getState()
    const fsNodeToMove = state.move.fsNodes[0]
    const target = state.move.target!
    Api.move(fsNodeToMove, target).then(movedfsNode => {
      dispatch(moveSuccess(fsNodeToMove, movedfsNode))
    }).catch(error => {
      dispatch(moveError(error))
    })
  }
}

export type MoveSuccess = { type: "MoveSuccess", movedFsNode: FsNode, newFsNode: FsNode }
export const moveSuccess = (movedFsNode: FsNode, newFsNode: FsNode): MoveSuccess => ({ type: "MoveSuccess", movedFsNode, newFsNode })

export type MoveError = { type: "MoveError", error: Api.ApiError }
export const moveError = (error: Api.ApiError): MoveError => ({
  type: "MoveError",
  error
})

export type ChangeMoveTarget = { type: "ChangeMoveTarget" }
export function changeMoveTarget(path: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "ChangeMoveTarget" })
    Api.fetchDirectory(path).then(fetchedTarget => {
      dispatch(changeMoveTargetSuccess(fetchedTarget))
    }).catch(error => {
      dispatch(changeMoveTargetError(error))
    })
  }
}
export type ChangeMoveTargetSuccess = { type: "ChangeMoveTargetSuccess", target: FsDirectory }
export const changeMoveTargetSuccess = (target: FsDirectory): ChangeMoveTargetSuccess => ({ type: "ChangeMoveTargetSuccess", target })

export type ChangeMoveTargetError = { type: "ChangeMoveTargetError", error: Api.ApiError }
export const changeMoveTargetError = (error: Api.ApiError): ChangeMoveTargetError => ({
  type: "ChangeMoveTargetError",
  error
})
