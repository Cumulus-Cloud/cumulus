import { getType } from "typesafe-actions"
import { NewFolderActions } from "files/newFolder/NewFolderActions"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

export interface NewFolderState {
  newFolderName: string
  loading: boolean
  wantCreateNewFolder: boolean
  error?: ApiError
}

const initState: NewFolderState = {
  newFolderName: "",
  loading: false,
  wantCreateNewFolder: false,
}

export const NewFolderReducer = (state: NewFolderState = initState, action: Actions) => {
  switch (action.type) {
    case getType(NewFolderActions.newFolderNameChange): return { ...state, newFolderName: action.payload.newFolderName }
    case getType(NewFolderActions.wantCreateNewFolder): return { ...state, wantCreateNewFolder: !state.wantCreateNewFolder, newFolderName: "" }
    case getType(NewFolderActions.createNewFolder): return { ...state, loading: true }
    case getType(NewFolderActions.createNewFolderSuccess): return { ...state, loading: false, wantCreateNewFolder: false, newFolderName: "" }
    case getType(NewFolderActions.createNewFolderError): return { ...state, error: action.payload.error, loading: false }
    default: return state
  }
}
