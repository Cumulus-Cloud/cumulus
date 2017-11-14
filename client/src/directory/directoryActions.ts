import { Directory, FsNode } from "models/FsNode"

export type DirectoryAction =
  ADD_DIRECTORY |
  ADD_CREATED_FS_NODE |
  TOGGLE_CREATE_NEW_DIRECTORY |
  CHANGE_NEW_DIRECTORY_NAME


export type ADD_DIRECTORY = { type: "ADD_DIRECTORY", directory: Directory }
export function addDirectory(directory: Directory): ADD_DIRECTORY {
  return { type: "ADD_DIRECTORY", directory }
}

export type ADD_CREATED_FS_NODE = { type: "ADD_CREATED_FS_NODE", fsNode: FsNode }
export function addCreatedFsNode(fsNode: FsNode): ADD_CREATED_FS_NODE {
  return { type: "ADD_CREATED_FS_NODE", fsNode }
}

export type TOGGLE_CREATE_NEW_DIRECTORY = { type: "TOGGLE_CREATE_NEW_DIRECTORY" }
export function toggleCreateNewDirectory(): TOGGLE_CREATE_NEW_DIRECTORY {
  return {
    type: "TOGGLE_CREATE_NEW_DIRECTORY",
  }
}

export type CHANGE_NEW_DIRECTORY_NAME = { type: "CHANGE_NEW_DIRECTORY_NAME", name: string }
export function changeNewDirectoryName(name: string): CHANGE_NEW_DIRECTORY_NAME {
  return {
    type: "CHANGE_NEW_DIRECTORY_NAME",
    name
  }
}




/*
import { Action } from "redux"
import { AppAction } from "../Redux"
import { Directory } from "../models/FsNode"
import { FsNode } from "../models/FsNode"
import * as Api from "../services/Api"
import { store } from "./DirectoryContainer"


export const CREATE_DIRECTORY_ERRORS: string = "CREATE_DIRECTORY_ERRORS"
export function createDirectoryErrors(errors: Record<string, string[]>): AppAction {
  return {
    type: CREATE_DIRECTORY_ERRORS,
    payload: errors
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
*/