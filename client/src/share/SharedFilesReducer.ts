import { SharedFilesAction } from "share/SbaredFilesActions"
import { SharingItem } from "models/Sharing"
import { ApiError } from "models/ApiError"

export interface SharedFilesState {
  loading: boolean
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
    default: return state
  }
}
