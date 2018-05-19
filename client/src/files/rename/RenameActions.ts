import { createAction, ActionType } from "typesafe-actions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const RenameActions = {
  wantRename: createAction("WantRename", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  cancelRename: createAction("CancelRename"),
  changeName: createAction("ChangeName", resolve => (name: string) => resolve({ name })),
  rename: createAction("Rename", resolve => (newName: string, fsNode: FsNode) => resolve({ newName, fsNode })),
  renameSuccess: createAction("RenameSuccess", resolve => (fsNode: FsNode) => resolve({ fsNode })),
  renameError: createAction("RenameError", resolve => (error: ApiError) => resolve({ error })),
}

export type RenameAction = ActionType<typeof RenameActions>
