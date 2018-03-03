import { Action } from "redux"
import { FsNode, FsFile } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "services/Api"
import { CreateNewFolderSuccess } from "files/newFolder/NewFolderActions"
import { OnUploadFileSuccess } from "files/upload/UploadActions"
import { MoveSuccess } from "files/move/MoveActions"
import { RenameSuccess } from "files/rename/RenameActions"

export type FileSystemAction =
  FetchDirectory |
  FetchDirectorySuccess |
  FetchDirectoryError |
  CreateNewFolderSuccess |
  OnDeleteFsNode |
  OnDeleteFsNodeSuccess |
  OnDeleteFsNodeError |
  OnUploadFileSuccess |
  ShowPreview |
  Sharing |
  SharingSuccess |
  SharingError |
  CloseShare |
  ShowFsNodeInfos |
  HideFsNodeInfos |
  SelectFsNode |
  DeselectFsNode |
  CanselSelectionOfFsNode |
  MoveSuccess |
  RenameSuccess

export interface FetchDirectory extends Action {
  type: "FetchDirectory"
  path: string
}
export function fetchDirectory(path: string): FetchDirectory {
  return { type: "FetchDirectory", path }
}

export interface FetchDirectorySuccess extends Action {
  type: "FetchDirectorySuccess"
  directory: FsNode
}
export function fetchDirectorySuccess(directory: FsNode): FetchDirectorySuccess {
  return { type: "FetchDirectorySuccess", directory }
}

export interface FetchDirectoryError extends Action {
  type: "FetchDirectoryError"
  error: ApiError
}
export function fetchDirectoryError(error: ApiError): FetchDirectoryError {
  return { type: "FetchDirectoryError", error }
}

export interface OnDeleteFsNode extends Action {
  type: "OnDeleteFsNode"
  fsNode: FsNode
}
export function onDeleteFsNode(fsNode: FsNode): OnDeleteFsNode {
  return { type: "OnDeleteFsNode", fsNode }
}

export interface OnDeleteFsNodeSuccess extends Action {
  type: "OnDeleteFsNodeSuccess"
  fsNode: FsNode
}
export function onDeleteFsNodeSuccess(fsNode: FsNode): OnDeleteFsNodeSuccess {
  return { type: "OnDeleteFsNodeSuccess", fsNode }
}

export interface OnDeleteFsNodeError extends Action {
  type: "OnDeleteFsNodeError"
  error: ApiError
}
export function onDeleteFsNodeError(error: ApiError): OnDeleteFsNodeError {
  return { type: "OnDeleteFsNodeError", error }
}

export interface ShowPreview extends Action {
  type: "ShowPreview"
  fsFile?: FsFile
}
export function onShowPreview(fsFile?: FsFile): ShowPreview {
  return { type: "ShowPreview", fsFile }
}

export interface Sharing extends Action {
  type: "Sharing"
  fsNode: FsNode
}
export function onSharing(fsNode: FsNode): Sharing {
  return { type: "Sharing", fsNode }
}

export interface SharingSuccess extends Action {
  type: "SharingSuccess"
  share: Share
  fsNode: FsNode
}
export function onSharingSuccess(share: Share, fsNode: FsNode): SharingSuccess {
  return { type: "SharingSuccess", share, fsNode }
}

export interface SharingError extends Action {
  type: "SharingError"
  error: ApiError
}
export function onSharingError(error: ApiError): SharingError {
  return { type: "SharingError", error }
}

export interface CloseShare extends Action {
  type: "CloseShare"
}
export function onCloseShare(): CloseShare {
  return { type: "CloseShare" }
}

export interface ShowFsNodeInfos extends Action {
  type: "ShowFsNodeInfos"
  fsNode: FsNode
}
export function showFsNodeInfos(fsNode: FsNode): ShowFsNodeInfos {
  return { type: "ShowFsNodeInfos", fsNode }
}

export interface HideFsNodeInfos extends Action {
  type: "HideFsNodeInfos"
}
export function hideFsNodeInfos(): HideFsNodeInfos {
  return { type: "HideFsNodeInfos" }
}

export interface SelectFsNode extends Action {
  type: "SelectFsNode"
  fsNode: FsNode
}
export function selectFsNode(fsNode: FsNode): SelectFsNode {
  return { type: "SelectFsNode", fsNode }
}

export interface DeselectFsNode extends Action {
  type: "DeselectFsNode"
  fsNode: FsNode
}
export function deselectFsNode(fsNode: FsNode): DeselectFsNode {
  return { type: "DeselectFsNode", fsNode }
}

export interface CanselSelectionOfFsNode extends Action {
  type: "CanselSelectionOfFsNode"
}
export function canselSelectionOfFsNode(): CanselSelectionOfFsNode {
  return { type: "CanselSelectionOfFsNode" }
}
