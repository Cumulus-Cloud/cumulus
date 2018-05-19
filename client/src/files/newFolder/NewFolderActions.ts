import { createAction, ActionType } from "typesafe-actions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const NewFolderActions = {
  newFolderNameChange: createAction("NewFolderNameChange", resolve => (newFolderName: string) => resolve({ newFolderName })),
  wantCreateNewFolder: createAction("WantCreateNewFolder"),
  createNewFolder: createAction("CreateNewFolder",
    resolve => (currentDirectory: FsNode, newFolderName: string) => resolve({ currentDirectory, newFolderName })
  ),
  createNewFolderSuccess: createAction("CreateNewFolderSuccess", resolve => (newFolder: FsNode) => resolve({ newFolder })),
  createNewFolderError: createAction("CreateNewFolderError", resolve => (error: ApiError) => resolve({ error })),
}

export type NewFolderAction = ActionType<typeof NewFolderActions>
