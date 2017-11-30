import { UploadAction } from "upload/UploadActions"
import { FileToUpload } from "models/FileToUpload"

export interface UploadState {
  idCounter: number
  wantUpload: boolean
  filesToUpload: FileToUpload[]
}

const initState: UploadState = {
  idCounter: 1,
  wantUpload: false,
  filesToUpload: [],
}

export const UploadReducer = (state: UploadState = initState, action: UploadAction): UploadState => {
  switch (action.type) {
    case "OnWantUpload": return { ...state, wantUpload: !state.wantUpload, filesToUpload: [] }
    case "OnAddFiles": {
      return {
        ...state,
        filesToUpload: [...state.filesToUpload, ...action.filesToUpload],
        idCounter: state.idCounter + action.filesToUpload.length
      }
    }
    case "OnUploadFile": {
      return { ...state, filesToUpload: state.filesToUpload.map(fileToUpload => ({ ...fileToUpload, loading: true})) }
    }
    case "OnUploadFileSuccess": return { ...state, filesToUpload: state.filesToUpload.filter(f => f.id !== action.fileToUpload.id) }
    case "OnUploadFileError": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, progress: 0 }
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case "OnProgressUpload": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, progress: action.progress }
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case "SelectCipher": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, cipher: action.cipher } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case "SelectCompression": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, compression: action.compression } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    default: return state
  }
}
