import { UploadAction } from "upload/UploadActions"

export interface UploadState {
  loading: boolean
  progress: number
  wantUpload: boolean
  files: File[]
}

const initState: UploadState = {
  wantUpload: false,
  loading: false,
  progress: 0,
  files: []
}

export const UploadReducer = (state: UploadState = initState, action: UploadAction): UploadState => {
  switch (action.type) {
    case "OnWantUpload": return { ...state, wantUpload: !state.wantUpload, files: [], progress: 0 }
    case "OnAddFiles": return { ...state, files: action.files }
    case "OnUploadFile": return { ...state, loading: true }
    case "OnUploadFileSuccess": return { ...state, loading: false, wantUpload: false, files: [], progress: 0 }
    case "OnUploadFileError": return { ...state, loading: false, progress: 0 }
    case "OnProgressUpload": return { ...state, progress: action.progress }
    default: return state
  }
}
