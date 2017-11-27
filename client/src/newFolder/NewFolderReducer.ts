import { NewFolderAction } from "newFolder/NewFolderActions"
import { ApiError } from "services/Api"

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

export const NewFolderReducer = (state: NewFolderState = initState, action: NewFolderAction) => {
  switch (action.type) {
    case "OnNewFolderNameChange": return { ...state, newFolderName: action.newFolderName }
    case "OnWantCreateNewFolder": return { ...state, wantCreateNewFolder: !state.wantCreateNewFolder, newFolderName: "" }
    case "OnCreateNewFolder": return { ...state, loading: true }
    case "OnCreateNewFolderSuccess": return { ...state, loading: false, wantCreateNewFolder: false, newFolderName: "" }
    case "OnCreateNewFolderError": return { ...state, error: action.error, loading: false }
    default: return state
  }
}
