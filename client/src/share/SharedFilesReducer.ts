import { SharedFilesAction } from "share/SharedFilesActions"
import { SharingItem } from "models/Sharing"
import { ApiError } from "models/ApiError"

export interface SharedFilesState {
  loading: boolean
  sharedFilesLoading?: string
  error?: ApiError
  sharings: SharingItem[]
}

const initState: SharedFilesState = {
  loading: false,
  sharings: []
}

export const SharedFilesReducer = (state: SharedFilesState = initState, action: SharedFilesAction) => {
  switch (action.type) {
    case "FetchSharedFiles": return { ...state, loading: true }
    case "FetchSharedFilesSuccess": return { ...state, loading: false, sharings: action.sharingApiResponse.items }
    case "FetchSharedFilesError": return { ...state, loading: false, error: action.error }
    case "DeleteSharedFile": return { ...state, sharedFilesLoading: action.sharing.sharing.id }
    case "DeleteSharedFileSuccess": return {
      ...state,
      sharedFilesLoading: undefined,
      sharings: state.sharings.filter(s => s.sharing.id !== action.sharing.sharing.id)
    }
    case "DeleteSharedFileError": return { ...state, sharedFilesLoading: undefined }
    default: return state
  }
}
