import { GetDirectoryFailureAction } from './fsActions'
import { ApiError } from './../../models/ApiError'
import { Directory } from './../../models/FsNode'
import { Action } from 'redux'
import { ActionCreator } from 'react-redux'


/**
 * Get the requested directory. If the requested element is not a directory, this will fail.
 */
export interface GetDirectoryAction extends Action {
  type: 'FS/GET_DIRECTORY'
  payload: {
    path: string,
    contentOffset: number
  }
}

export const getDirectory: ActionCreator<GetDirectoryAction> =
  (path: string, contentOffset: number) => ({
    type: 'FS/GET_DIRECTORY',
    payload: {
      path,
      contentOffset
    }
  })

/**
 * Dispatched after a 'GetDirectoryAction' if the requested directory has been sucessfully loaded.
 */
export interface GetDirectorySuccessAction extends Action {
  type: 'FS/GET_DIRECTORY_SUCCESS'
  payload: {
    directory: Directory
  }
}

export const getDirectorySuccess: ActionCreator<GetDirectorySuccessAction> =
  (directory: Directory) => ({
    type: 'FS/GET_DIRECTORY_SUCCESS',
    payload: {
      directory
    }
  })

/**
 * Dispatched after a 'GetDirectoryAction' if the requested directory could not be loaded.
 */
export interface GetDirectoryFailureAction extends Action {
  type: 'FS/GET_DIRECTORY_FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const getDirectoryFailure: ActionCreator<GetDirectoryFailureAction> =
  (error: ApiError) => ({
    type: 'FS/GET_DIRECTORY_FAILURE',
    payload: {
      error
    }
  })

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
  type: 'FS/CREATE_DIRECTORY_SUCCESS'
  payload: {
    directory: Directory
  }
}

export const createDirectorySuccess: ActionCreator<CreateDirectorySuccessAction> =
  (directory: Directory) => ({
    type: 'FS/CREATE_DIRECTORY_SUCCESS',
    payload: {
      directory
    }
  })


export interface CreateDirectoryFailureAction extends Action {
  type: 'FS/CREATE_DIRECTORY_FAILURE'
  payload: {
    error: ApiError
  }
}

export const createDirectoryFailure: ActionCreator<CreateDirectoryFailureAction> =
  (error: ApiError) => ({
    type: 'FS/CREATE_DIRECTORY_FAILURE',
    payload: {
      error
    }
  })

export type FsActions =
  GetDirectoryAction |
  GetDirectorySuccessAction |
  GetDirectoryFailureAction |
  CreateDirectoryAction |
  CreateDirectorySuccessAction |
  CreateDirectoryFailureAction
