import { NewFolderAction } from "files/newFolder/NewFolderActions"
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
    case "NewFolderNameChange": return { ...state, newFolderName: action.newFolderName }
    case "WantCreateNewFolder": return { ...state, wantCreateNewFolder: !state.wantCreateNewFolder, newFolderName: "" }
    case "CreateNewFolder": return { ...state, loading: true }
    case "CreateNewFolderSuccess": return { ...state, loading: false, wantCreateNewFolder: false, newFolderName: "" }
    case "CreateNewFolderError": return { ...state, error: action.error, loading: false }
    default: return state
  }
}
