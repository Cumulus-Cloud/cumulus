import { getType } from "typesafe-actions"
import { UploadActions } from "files/upload/UploadActions"
import { FileToUpload } from "models/FileToUpload"
import { UploadModalStatus } from "models/UploadModalStatus"
import { Actions } from "actions"

export interface UploadState {
  status: UploadModalStatus
  filesToUpload: FileToUpload[]
}

const initState: UploadState = {
  status: "None",
  filesToUpload: [],
}

export const UploadReducer = (state: UploadState = initState, action: Actions): UploadState => {
  switch (action.type) {
    case getType(UploadActions.uploaderModalStatus): return {
      ...state,
      status: action.payload.status,
      filesToUpload: action.payload.status === "None" ? [] : state.filesToUpload
    }
    case getType(UploadActions.addFiles): {
      return {
        ...state,
        filesToUpload: [...state.filesToUpload, ...action.payload.files],
        status: "Open",
      }
    }
    case getType(UploadActions.removeFileToUpload): return {
      ...state,
      filesToUpload: state.filesToUpload.filter(f => f.id !== action.payload.fileToUpload.id)
    }
    case getType(UploadActions.uploadFile): {
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
    case getType(UploadActions.uploadFileSuccess): {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.payload.fileToUpload.id) {
          return { ...fileToUpload, status: "Done", progress: 100, error: undefined } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case getType(UploadActions.uploadFileError): {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.payload.fileToUpload.id) {
          return { ...fileToUpload, progress: 0, status: "Ready", error: action.payload.error } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case getType(UploadActions.progressUpload): {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.payload.fileToUpload.id) {
          return { ...fileToUpload, progress: action.payload.progress }
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case getType(UploadActions.selectCipher): {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.payload.fileToUpload.id) {
          return { ...fileToUpload, cipher: action.payload.cipher } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    case getType(UploadActions.selectCompression): {
      const filesToUpload = state.filesToUpload.map(fileToUpload => {
        if (fileToUpload.id === action.payload.fileToUpload.id) {
          return { ...fileToUpload, compression: action.payload.compression } as FileToUpload
        } else {
          return fileToUpload
        }
      })
      return { ...state, filesToUpload }
    }
    default: return state
  }
}
