import { buildAction, ActionsUnion } from "typesafe-actions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const RenameActions = {
  wantRename: buildAction("WantRename").payload<{ fsNode: FsNode }>(),
  cancelRename: buildAction("CancelRename").empty(),
  changeName: buildAction("ChangeName").payload<{ name: string }>(),
  rename: buildAction("Rename").payload<{ newName: string, fsNode: FsNode }>(),
  renameSuccess: buildAction("RenameSuccess").payload<{ fsNode: FsNode }>(),
  renameError: buildAction("RenameError").payload<{ error: ApiError }>(),
}

export type RenameAction = ActionsUnion<typeof RenameActions>
