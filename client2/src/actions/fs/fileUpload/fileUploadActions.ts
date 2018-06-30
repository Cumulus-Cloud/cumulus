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

export type FileUploadActions =
  SelectUploadFileAction |
  UpdateUploadFileAction |
  DeleteUploadFileAction
