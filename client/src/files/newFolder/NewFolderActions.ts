import { buildAction, ActionsUnion } from "typesafe-actions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const NewFolderActions = {
  newFolderNameChange: buildAction("NewFolderNameChange").payload<{ newFolderName: string }>(),
  wantCreateNewFolder: buildAction("WantCreateNewFolder").empty(),
  createNewFolder: buildAction("CreateNewFolder").payload<{ currentDirectory: FsNode, newFolderName: string }>(),
  createNewFolderSuccess: buildAction("CreateNewFolderSuccess").payload<{ newFolder: FsNode }>(),
  createNewFolderError: buildAction("CreateNewFolderError").payload<{ error: ApiError }>(),
}

export type NewFolderAction = ActionsUnion<typeof NewFolderActions>
