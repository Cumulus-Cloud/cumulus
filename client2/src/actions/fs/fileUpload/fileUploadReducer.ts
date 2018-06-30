import { Reducer } from 'redux'

import FileUploadState from './fileUploadState'
import { FileUploadActions } from './fileUploadActions'

const initialState: FileUploadState = {
  files: []
}

const reducer: Reducer<FileUploadState, FileUploadActions> = (state: FileUploadState = initialState, action: FileUploadActions) => {
  switch(action.type) {
    case 'FS/SELECT_UPLOAD_FILE': {
      const files = action.payload.files
      const updatedFiles = state.files.concat(files).map((f, i) => { return { ...f, id: i } })

      return { files: updatedFiles }
    }
    case 'FS/UPDATE_UPLOAD_FILE': {
      const updatedFile = action.payload.file
      const updatedFiles = state.files.map((f) => {
        if(updatedFile.id === f.id)
          return updatedFile
        else
          return f
      })
      return { files: updatedFiles }
    }
    case 'FS/DELETE_UPLOAD_FILE': {
      const deletedFile = action.payload.file
      const updatedFiles = state.files.filter((f) => f.id !== deletedFile.id)
      return { files: updatedFiles }
    }
    default:
      return state
  }
}

export default reducer
