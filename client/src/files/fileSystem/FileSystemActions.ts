import { createAction, ActionType } from "typesafe-actions"

import { FsNode, FsFile, FsDirectory } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "models/ApiError"

export const FileSystemActions = {
  fetchDirectory: createAction("FetchDirectory", resolve => (path: string) => resolve({ path })),
  fetchDirectorySuccess: createAction("FetchDirectorySuccess", resolve => (directory: FsDirectory) => resolve({ directory })),
  fetchDirectoryError: createAction("FetchDirectoryError", resolve => (error: ApiError) => resolve({ error })),
  deleteFsNode: createAction("DeleteFsNode", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  deleteFsNodeSuccess: createAction("DeleteFsNodeSuccess", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  deleteFsNodeError: createAction("DeleteFsNodeError", resolve => (error: ApiError) => resolve({ error })),
  showPreview: createAction("ShowPreview", resolve => (fsFile?: FsFile) => resolve({ fsFile })),
  sharing: createAction("Sharing", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  sharingSuccess: createAction("SharingSuccess", resolve => (share: Share, fsNode: FsNode) => resolve({ share, fsNode })),
  sharingError: createAction("SharingError", resolve => (error: ApiError) => resolve({ error })),
  closeShare: createAction("CloseShare"),
  showFsNodeInfos: createAction("ShowFsNodeInfos", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  hideFsNodeInfos: createAction("HideFsNodeInfos"),
  selectFsNode: createAction("SelectFsNode", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  deselectFsNode: createAction("DeselectFsNode", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  canselSelectionOfFsNode: createAction("CanselSelectionOfFsNode"),
}

export type FileSystemAction = ActionType<typeof FileSystemActions>
