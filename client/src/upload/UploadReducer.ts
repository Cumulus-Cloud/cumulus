import { UploadAction } from "upload/UploadActions"

export interface UploadState {
  wantUpload: boolean
  files: File[]
}

const initState: UploadState = {
  wantUpload: false,
  files: []
}

export const UploadReducer = (state: UploadState = initState, action: UploadAction): UploadState => {
  switch (action.type) {
    case "OnWantUpload": return { ...state, wantUpload: !state.wantUpload }
    case "OnAddFiles": return { ...state, files: action.files }
    default: return state
  }
}
