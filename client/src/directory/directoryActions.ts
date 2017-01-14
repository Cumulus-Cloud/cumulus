import { Action } from "redux"
import { AppAction } from "../Redux"
import { Directory } from "../models/FsNode"
import { FsNode } from "../models/FsNode"
import * as Api from "../services/Api"
import { store } from "./DirectoryContainer"

export const ADD_DIRECTORY_ACTION: string = "ADD_DIRECTORY_ACTION"
export function addDirectory(directory: Directory) {
  return {
    type: ADD_DIRECTORY_ACTION,
    directory
  }
}


export const LOADING_ACTION: string = "LOADING_ACTION"
export function loading(loading: boolean) {
  return {
    type: LOADING_ACTION,
    loading
  }
}

export const ADD_CREATED_FS_NODE: string = "ADD_CREATED_FS_NODE"
export function addCreatedFsNode(fsNode: FsNode) {
  return {
    type: ADD_CREATED_FS_NODE,
    fsNode
  }
}

export const CREATE_DIRECTORY_ERRORS: string = "CREATE_DIRECTORY_ERRORS"
export function createDirectoryErrors(errors: Record<string, string[]>): AppAction {
  return {
    type: CREATE_DIRECTORY_ERRORS,
    payload: errors
  }
}

export const TOGGLE_CREATE_NEW_DIRECTORY: string = "TOGGLE_CREATE_NEW_DIRECTORY"
export function toggleCreateNewDirectory(): Action {
  return {
    type: TOGGLE_CREATE_NEW_DIRECTORY,
  }
}

export const CHANGE_NEW_DIRECTORY_NAME: string = "CHANGE_NEW_DIRECTORY_NAME"
export function changeNewDirectoryName(name: string): AppAction {
  return {
    type: CHANGE_NEW_DIRECTORY_NAME,
    payload: name
  }
}

export function fetchDirectory(path: string) {
  store.dispatch(loading(true))
  Api.directory(path).then(directory => {
    store.dispatch(addDirectory(directory))
  }).catch(error => {
    console.debug("fetchDirectory error", error) // TODO
    store.dispatch(loading(false))
  })
}

export function createDirectory(path: string) {
  Api.createDirectory(path).then(newDirectory => {
    store.dispatch(addCreatedFsNode(newDirectory))
  }).catch(error => {
    if (error.errors) {
      store.dispatch(createDirectoryErrors(error.errors))
    } else {
      console.error("createDirectory error", error)
    }
  })
}
