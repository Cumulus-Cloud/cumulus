import { FsNode, FsFile } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "services/Api"
import { OnCreateNewFolderSuccess } from "files/newFolder/NewFolderActions"
import { OnUploadFileSuccess } from "files/upload/UploadActions"
import { MoveSuccess } from "files/move/MoveActions"
import { RenameSuccess } from "files/rename/RenameActions"

export type FileSystemAction =
  FetchDirectory |
  FetchDirectorySuccess |
  FetchDirectoryError |
  OnCreateNewFolderSuccess |
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

export type Sharing = { type: "Sharing", fsNode: FsNode }
export function onSharing(fsNode: FsNode): Sharing {
  return { type: "Sharing", fsNode }
}

export type SharingSuccess = { type: "SharingSuccess", share: Share, fsNode: FsNode }
export const onSharingSuccess = (share: Share, fsNode: FsNode): SharingSuccess => ({ type: "SharingSuccess", share, fsNode })

export type SharingError = { type: "SharingError", error: ApiError }
export const onSharingError = (error: ApiError): SharingError => ({ type: "SharingError", error })

export type ShowFsNodeInfos = { type: "ShowFsNodeInfos", fsNode: FsNode }
export const showFsNodeInfos = (fsNode: FsNode): ShowFsNodeInfos => ({ type: "ShowFsNodeInfos", fsNode })

export type HideFsNodeInfos = { type: "HideFsNodeInfos" }
export const hideFsNodeInfos = (): HideFsNodeInfos => ({ type: "HideFsNodeInfos" })

export type SelectFsNode = { type: "SelectFsNode", fsNode: FsNode }
export const selectFsNode = (fsNode: FsNode): SelectFsNode => ({ type: "SelectFsNode", fsNode })

export type DeselectFsNode = { type: "DeselectFsNode", fsNode: FsNode }
export const deselectFsNode = (fsNode: FsNode): DeselectFsNode => ({ type: "DeselectFsNode", fsNode })

export type CanselSelectionOfFsNode = { type: "CanselSelectionOfFsNode" }
export const canselSelectionOfFsNode = (): CanselSelectionOfFsNode => ({ type: "CanselSelectionOfFsNode" })

export type CloseShare = { type: "CloseShare" }
export const onCloseShare = (): CloseShare => ({ type: "CloseShare" })

export type FetchDirectory = { type: "FetchDirectory", path: string }
export function fetchDirectory(path: string): FetchDirectory {
  return { type: "FetchDirectory", path }
}

export type FetchDirectorySuccess = { type: "FetchDirectorySuccess", directory: FsNode }
export const fetchDirectorySuccess = (directory: FsNode): FetchDirectorySuccess => ({ type: "FetchDirectorySuccess", directory })

export type FetchDirectoryError = { type: "FetchDirectoryError", error: ApiError }
export const fetchDirectoryError = (error: ApiError): FetchDirectoryError => ({ type: "FetchDirectoryError", error })

export type OnDeleteFsNode = { type: "OnDeleteFsNode", fsNode: FsNode }
export function onDeleteFsNode(fsNode: FsNode): OnDeleteFsNode {
  return { type: "OnDeleteFsNode", fsNode }
}

export type OnDeleteFsNodeSuccess = { type: "OnDeleteFsNodeSuccess", fsNode: FsNode }
export const onDeleteFsNodeSuccess = (fsNode: FsNode): OnDeleteFsNodeSuccess => ({ type: "OnDeleteFsNodeSuccess", fsNode })

export type OnDeleteFsNodeError = { type: "OnDeleteFsNodeError", error: ApiError }
export const onDeleteFsNodeError = (error: ApiError): OnDeleteFsNodeError => ({ type: "OnDeleteFsNodeError", error })

export type ShowPreview = { type: "ShowPreview", fsFile?: FsFile }
export const onShowPreview = (fsFile?: FsFile): ShowPreview => ({ type: "ShowPreview", fsFile })
