import { Directory } from '../models/FsNode'
import { Action } from 'redux'
import { ActionCreator } from 'react-redux'
import { ApiError } from '../models/ApiError'


export interface LoadDirectoryAction extends Action {
  type: 'LOAD_DIRECTORY'
  payload: {
    path: string
  }
}

export const loadDirectory: ActionCreator<LoadDirectoryAction> =
  (path: string) => ({
    type: 'LOAD_DIRECTORY',
    payload: {
      path: path
    }
  })

export interface LoadDirectorySuccessAction extends Action {
  type: 'LOAD_DIRECTORY_SUCCESS'
  payload: {
    directory: Directory
  }
}

export const loadDirectorySuccess: ActionCreator<LoadDirectorySuccessAction> =
  (directory: Directory) => ({
    type: 'LOAD_DIRECTORY_SUCCESS',
    payload: {
      directory: directory
    }
  })

export interface LoadDirectoryFailureAction extends Action {
  type: 'LOAD_DIRECTORY_FAILURE'
  payload: {
    error: ApiError
  }
}

export const loadDirectoryFailure: ActionCreator<LoadDirectoryFailureAction> =
  (error: ApiError) => ({
    type: 'LOAD_DIRECTORY_FAILURE',
    payload: {
      error: error
    }
  })

  
export type DirectoryActions = LoadDirectoryAction | LoadDirectorySuccessAction | LoadDirectoryFailureAction

/*
function createDirectory(path: string) {
  return {
    type: CREATE_FSNODE,
    path: path
  }
}

function selectFsNode(path: string) {

}

function unselectDirectory(path: string) {

}

function deleteFsNode(path: string) {
  return {
    type: DELETE_DIRECTORY,
    path: path
  }
}

function shareFsNode(path: string) {
  return {
    type: SHARE_FSNODE,
    path: path
  }
}
*/