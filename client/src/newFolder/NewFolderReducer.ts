import { NewFolderAction } from "newFolder/NewFolderActions"

export interface NewFolderState {
  newFolderName: string
  loading: boolean
  wantCreateNewFolder: boolean
}

const initState: NewFolderState = {
  newFolderName: "",
  loading: false,
  wantCreateNewFolder: false,
}

export const NewFolderReducer = (state: NewFolderState = initState, action: NewFolderAction) => {
  switch (action.type) {
    case "OnNewFolderNameChange": return { ...state, newFolderName: action.newFolderName }
    case "OnWantCreateNewFolder": return { ...state, wantCreateNewFolder: !state.wantCreateNewFolder }
    case "OnCreateNewFolder": return { ...state, loading: true }
    case "OnCreateNewFolderSuccess": return { ...state, loading: false, wantCreateNewFolder: false }
    case "OnCreateNewFolderError": return { ...state, loading: false }
    default: return state
  }
}
