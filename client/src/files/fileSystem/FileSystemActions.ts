import { FsNode, FsFile } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "models/ApiError"

import { buildAction, ActionsUnion } from "typesafe-actions"

export const FileSystemActions = {
  fetchDirectory: buildAction("FetchDirectory").payload<{ path: string }>(),
  fetchDirectorySuccess: buildAction("FetchDirectorySuccess").payload<{ directory: FsNode }>(),
  fetchDirectoryError: buildAction("FetchDirectoryError").payload<{ error: ApiError }>(),
  deleteFsNode: buildAction("DeleteFsNode").payload<{ fsNode: FsNode }>(),
  deleteFsNodeSuccess: buildAction("DeleteFsNodeSuccess").payload<{ fsNode: FsNode }>(),
  deleteFsNodeError: buildAction("DeleteFsNodeError").payload<{ error: ApiError }>(),
  showPreview: buildAction("ShowPreview").payload<{ fsFile?: FsFile }>(),
  sharing: buildAction("Sharing").payload<{ fsNode: FsNode }>(),
  sharingSuccess: buildAction("SharingSuccess").payload<{ share: Share, fsNode: FsNode }>(),
  sharingError: buildAction("SharingError").payload<{ error: ApiError }>(),
  closeShare: buildAction("CloseShare").empty(),
  showFsNodeInfos: buildAction("ShowFsNodeInfos").payload<{ fsNode: FsNode }>(),
  hideFsNodeInfos: buildAction("HideFsNodeInfos").empty(),
  selectFsNode: buildAction("SelectFsNode").payload<{ fsNode: FsNode }>(),
  deselectFsNode: buildAction("DeselectFsNode").payload<{ fsNode: FsNode }>(),
  canselSelectionOfFsNode: buildAction("CanselSelectionOfFsNode").empty(),
}

export type FileSystemAction = ActionsUnion<typeof FileSystemActions>
