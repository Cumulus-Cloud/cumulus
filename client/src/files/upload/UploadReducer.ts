import { UploadAction } from "files/upload/UploadActions"
import { FileToUpload } from "models/FileToUpload"
import { UploadModalStatus } from "models/UploadModalStatus"

export interface UploadState {
  status: UploadModalStatus
  filesToUpload: FileToUpload[]
}

const initState: UploadState = {
  status: "None",
  filesToUpload: [],
}

export const UploadReducer = (state: UploadState = initState, action: UploadAction): UploadState => {
  switch (action.type) {
    case "UploaderModalStatus": return { ...state, status: action.status, filesToUpload: action.status === "None" ? [] : state.filesToUpload  }
    case "AddFiles": {
      return {
        ...state,
        filesToUpload: [...state.filesToUpload, ...action.filesToUpload],
        status: "Open",
      }
    }
    case "RemoveFileToUpload": return { ...state, filesToUpload: state.filesToUpload.filter(f => f.id !== action.fileToUpload.id) }
    case "UploadFile": {
      return {
        ...state,
        filesToUpload: state.filesToUpload.map(fileToUpload => {
          if (fileToUpload.status === "Ready") {
            return { ...fileToUpload, status: "Loading"} as FileToUpload
          } else {
            return fileToUpload
          }
        })
      }
    }
    case "UploadFileSuccess": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, status: "Done", progress: 100 } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case "UploadFileError": {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.fileToUpload.id) {
          return { ...fileToUpload, progress: 0, status: "Ready" } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case "ProgressUpload": {
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
