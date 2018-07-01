import { Reducer } from 'redux'

import FileUploadState from './fileUploadState'
import { FileUploadActions } from './fileUploadActions'
import { FileUploadingState } from './fileUploadState'

const initialState: FileUploadState = {
  files: [],
  uploading: []
}

function updateField<T>(filter: (t: T) => boolean, update: (t: T) => T, items: T[]) {
  return items.map((i) => {
    if(filter(i))
      return update(i)
    else
      return i
  })
}

const reducer: Reducer<FileUploadState, FileUploadActions> = (state: FileUploadState = initialState, action: FileUploadActions) => {
  console.log(action.type)
  switch(action.type) {
    case 'FS/SELECT_UPLOAD_FILE': {
      const files = action.payload.files
      const updatedFiles = state.files.concat(files).map((f, i) => { return { ...f, id: i } })

      return { ...state, files: updatedFiles }
    }
    case 'FS/UPDATE_UPLOAD_FILE': {
      const updatedFile = action.payload.file
      const updatedFiles = state.files.map((f) => {
        if(updatedFile.id === f.id)
          return updatedFile
        else
          return f
      })
      return { ...state, files: updatedFiles }
    }
    case 'FS/DELETE_UPLOAD_FILE': {
      const deletedFile = action.payload.file
      const updatedFiles = state.files.filter((f) => f.id !== deletedFile.id)
      return { ...state, files: updatedFiles }
    }
    case 'FS/UPLOAD_FILE': {
      const uploadedFile = action.payload.file
      const uploadingFile = {
        file: uploadedFile,
        loading: true,
        start: new Date(),
        progress: 0
      }

      return { files: [], uploading: state.uploading.concat([uploadingFile])}
    }
    case 'FS/UPLOAD_FILE/PROGRESS': {
      const { progression, file } = action.payload
      const updatedUploads = state.uploading.map((upload) => {
        if(upload.file.id === file.id)
          return { ...upload, progress: progression }
        else
          return upload
      })

      return { ...state, uploading: updatedUploads}
    }
    case 'FS/UPLOAD_FILE/SUCCESS': {
      const { file } = action.payload
      const updatedUploads = state.uploading.map((upload) => {
        if(upload.file.id === file.id)
          return { ...upload, progress: 100, loading: false }
        else
          return upload
      })

      return { ...state, uploading: updatedUploads}
    }
    case 'FS/UPLOAD_FILE/FAILURE': {
      const { file, error } = action.payload
      const updatedUploads = state.uploading.map((upload) => {
        if(upload.file.id === file.id)
          return { ...upload, progress: 100, loading: false, error }
        else
          return upload
      })

      return { ...state, uploading: updatedUploads}
    }
    default:
      return state
  }
}

export default reducer
