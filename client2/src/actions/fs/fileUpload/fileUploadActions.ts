import { ApiError } from './../../../models/ApiError'
import { EnrichedFile } from './../../../models/EnrichedFile'
import { Action } from 'redux'
import { ActionCreator } from 'react-redux'


export interface SelectUploadFileAction extends Action {
  type: 'FS/SELECT_UPLOAD_FILE'
  payload: {
    files: EnrichedFile[]
  }
}

export const selectUploadFile: ActionCreator<SelectUploadFileAction> =
  (files: EnrichedFile[]) => ({
    type: 'FS/SELECT_UPLOAD_FILE',
    payload: {
      files
    }
  })

export interface UpdateUploadFileAction extends Action {
  type: 'FS/UPDATE_UPLOAD_FILE'
  payload: {
    file: EnrichedFile
  }
}

export const updateUploadFile: ActionCreator<UpdateUploadFileAction> =
  (file: EnrichedFile) => ({
    type: 'FS/UPDATE_UPLOAD_FILE',
    payload: {
      file
    }
  })

export interface DeleteUploadFileAction extends Action {
  type: 'FS/DELETE_UPLOAD_FILE'
  payload: {
    file: EnrichedFile
  }
}

export const deleteUploadFile: ActionCreator<DeleteUploadFileAction> =
  (file: EnrichedFile) => ({
    type: 'FS/DELETE_UPLOAD_FILE',
    payload: {
      file
    }
  })

export interface UploadAllFilesAction extends Action {
  type: 'FS/UPLOAD_ALL_FILES'
  payload: {}
}

export const uploadAllFiles: ActionCreator<UploadAllFilesAction> =
  () => ({
    type: 'FS/UPLOAD_ALL_FILES',
    payload: {}
  })

export interface UploadFileAction extends Action {
  type: 'FS/UPLOAD_FILE'
  payload: {
    file: EnrichedFile
  }
}

export const uploadFile: ActionCreator<UploadFileAction> =
  (file: EnrichedFile) => ({
    type: 'FS/UPLOAD_FILE',
    payload: {
      file
    }
  })

export interface UploadFileProgressAction extends Action {
  type: 'FS/UPLOAD_FILE/PROGRESS'
  payload: {
    file: EnrichedFile,
    progression: number
  }
}

export const uploadFileProgess: ActionCreator<UploadFileProgressAction> =
  (file: EnrichedFile, progression: number) => ({
    type: 'FS/UPLOAD_FILE/PROGRESS',
    payload: {
      file,
      progression
    }
  })


export interface UploadFileSuccessAction extends Action {
  type: 'FS/UPLOAD_FILE/SUCCESS'
  payload: {
    file: EnrichedFile // TODO return uploaded file
  }
}

export const uploadFileSuccess: ActionCreator<UploadFileSuccessAction> =
  (file: EnrichedFile) => ({
    type: 'FS/UPLOAD_FILE/SUCCESS',
    payload: {
      file
    }
  })


export interface UploadFileFailureAction extends Action {
  type: 'FS/UPLOAD_FILE/FAILURE'
  payload: {
    file: EnrichedFile,
    error: ApiError
  }
}

export const uploadFileFailure: ActionCreator<UploadFileFailureAction> =
  (file: EnrichedFile, error: ApiError) => ({
    type: 'FS/UPLOAD_FILE/FAILURE',
    payload: {
      file,
      error
    }
  })


export type FileUploadActions =
  SelectUploadFileAction |
  UpdateUploadFileAction |
  DeleteUploadFileAction |
  UploadAllFilesAction |
  UploadFileAction |
  UploadFileProgressAction |
  UploadFileSuccessAction |
  UploadFileFailureAction
