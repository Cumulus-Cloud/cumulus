import { Directory } from './../../../models/FsNode'
import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

import { ApiError } from '../../../models/ApiError'


export interface CreateDirectoryAction extends Action {
  type: 'FS/CREATE_DIRECTORY'
  payload: {
    path: string
  }
}

export const createDirectory: ActionCreator<CreateDirectoryAction> =
  (path: string) => ({
    type: 'FS/CREATE_DIRECTORY',
    payload: {
      path
    }
  })

export interface CreateDirectorySuccessAction extends Action {
  type: 'FS/CREATE_DIRECTORY/SUCCESS'
  payload: {
    directory: Directory
  }
}
  
export const createDirectorySuccess: ActionCreator<CreateDirectorySuccessAction> =
  (directory: Directory) => ({
    type: 'FS/CREATE_DIRECTORY/SUCCESS',
    payload: {
      directory
    }
  })

export interface CreateDirectoryFailureAction extends Action {
  type: 'FS/CREATE_DIRECTORY/FAILURE'
  payload: {
    error: ApiError
  }
}
    
export const createDirectoryFailure: ActionCreator<CreateDirectoryFailureAction> =
  (error: ApiError) => ({
    type: 'FS/CREATE_DIRECTORY/FAILURE',
    payload: {
      error
    }
  })

export type CreateDirectoryActions =
  CreateDirectoryAction |
  CreateDirectorySuccessAction |
  CreateDirectoryFailureAction
