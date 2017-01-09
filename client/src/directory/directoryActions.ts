import { Action } from "redux"
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
    console.debug("createDirectory error", error) // TODO
  })
}
