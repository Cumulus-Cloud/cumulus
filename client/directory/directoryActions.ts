import { Action } from "redux"
import { Directory } from "../models/FsNode"

export const ADD_DIRECTORY_ACTION: string = "ADD_DIRECTORY_ACTION"
type AddDirectoryAction = Action & { directory: Directory }
export function addDirectory(directory: Directory): AddDirectoryAction {
  return {
    type: ADD_DIRECTORY_ACTION,
    directory
  }
}
