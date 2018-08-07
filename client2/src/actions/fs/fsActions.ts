import { GetDirectoryFailureAction } from './fsActions'
import { ApiError } from './../../models/ApiError'
import { Directory, FsNode } from './../../models/FsNode'
import { Action } from 'redux'
import { ActionCreator } from 'react-redux'


/**
 * Get the requested directory. If the requested element is not a directory, this will fail.
 */
export interface GetDirectoryAction extends Action {
  type: 'FS/GET_DIRECTORY'
  payload: {
    path: string
  }
}

export const getDirectory: ActionCreator<GetDirectoryAction> =
  (path: string) => ({
    type: 'FS/GET_DIRECTORY',
    payload: {
      path
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

/**
 * Get the requested directory's content.
 */
export interface GetDirectoryContentAction extends Action {
  type: 'FS/GET_DIRECTORY_CONTENT'
  payload: {
    contentOffset: number
  }
}

export const getDirectoryContent: ActionCreator<GetDirectoryContentAction> =
  (contentOffset: number) => ({
    type: 'FS/GET_DIRECTORY_CONTENT',
    payload: {
      contentOffset
    }
  })

export interface GetDirectoryContentSuccessAction extends Action {
  type: 'FS/GET_DIRECTORY_CONTENT/SUCCESS'
  payload: {
    content: FsNode[],
    contentSize: number
  }
}

export const getDirectoryContentSuccess: ActionCreator<GetDirectoryContentSuccessAction> =
  (content: FsNode[], contentSize: number) => ({
    type: 'FS/GET_DIRECTORY_CONTENT/SUCCESS',
    payload: {
      content,
      contentSize
    }
  })

export interface GetDirectoryContentFailureAction extends Action {
  type: 'FS/GET_DIRECTORY_CONTENT/FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const getDirectoryContentFailure: ActionCreator<GetDirectoryContentFailureAction> =
  (error: ApiError) => ({
    type: 'FS/GET_DIRECTORY_CONTENT/FAILURE',
    payload: {
      error
    }
  })

export interface SelectNodeAction extends Action {
  type: 'FS/SELECT_NODE'
  payload: {
    id: string
  }
}
  
export const selectNode: ActionCreator<SelectNodeAction> =
  (id: string) => ({
    type: 'FS/SELECT_NODE',
    payload: {
      id
    }
  })

export interface SelectAllNodesAction extends Action {
  type: 'FS/SELECT_ALL_NODES'
  payload: {}
}
  
export const selectAllNodes: ActionCreator<SelectAllNodesAction> =
  () => ({
    type: 'FS/SELECT_ALL_NODES',
    payload: {}
  })

export interface DeselectNodeAction extends Action {
  type: 'FS/DESELECT_NODE'
  payload: {
    id: string
  }
}
  
export const deselectNode: ActionCreator<DeselectNodeAction> =
  (id: string) => ({
    type: 'FS/DESELECT_NODE',
    payload: {
      id
    }
  })

export interface DeselectAllNodesAction extends Action {
  type: 'FS/DESELECT_ALL_NODES'
  payload: {}
}
  
export const deselectAllNodes: ActionCreator<DeselectAllNodesAction> =
  () => ({
    type: 'FS/DESELECT_ALL_NODES',
    payload: {}
  })

export interface ShowNodeDetailsAction extends Action {
  type: 'FS/SHOW_NODE_DETAILS'
  payload: {
    id: string
  }
}
    
export const showNodeDetails: ActionCreator<ShowNodeDetailsAction> =
  (id: string) => ({
    type: 'FS/SHOW_NODE_DETAILS',
    payload: {
      id
    }
  })

export type FsActions =
  GetDirectoryAction |
  GetDirectorySuccessAction |
  GetDirectoryFailureAction |
  GetDirectoryContentAction |
  GetDirectoryContentSuccessAction |
  GetDirectoryContentFailureAction |
  SelectNodeAction |
  SelectAllNodesAction |
  DeselectNodeAction |
  DeselectAllNodesAction |
  ShowNodeDetailsAction
