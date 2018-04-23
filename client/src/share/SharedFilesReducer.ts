import { getType } from "typesafe-actions"
import { SharedFilesActions } from "share/SharedFilesActions"
import { SharingItem } from "models/Sharing"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

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

export const SharedFilesReducer = (state: SharedFilesState = initState, action: Actions) => {
  switch (action.type) {
    case getType(SharedFilesActions.fetchSharedFiles): return { ...state, loading: true }
    case getType(SharedFilesActions.fetchSharedFilesSuccess): return { ...state, loading: false, sharings: action.payload.sharingApiResponse.items }
    case getType(SharedFilesActions.fetchSharedFilesError): return { ...state, loading: false, error: action.payload.error }
    case getType(SharedFilesActions.deleteSharedFile): return { ...state, sharedFilesLoading: action.payload.sharing.sharing.id }
    case getType(SharedFilesActions.deleteSharedFileSuccess): return {
      ...state,
      sharedFilesLoading: undefined,
      sharings: state.sharings.filter(s => s.sharing.id !== action.payload.sharing.sharing.id)
    }
    case getType(SharedFilesActions.deleteSharedFileError): return { ...state, sharedFilesLoading: undefined }
    default: return state
  }
}
