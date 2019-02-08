import { ApiError } from 'models/ApiError'
import { Directory, FsNode } from 'models/FsNode'


interface AllSelection {
  type: 'ALL'
}

interface NoneSelection {
  type: 'NONE'
}

interface SomeSelection {
  type: 'SOME'
  selectedElements: string[]
}

export type FsNodeSelection = AllSelection | NoneSelection | SomeSelection

export interface Search {
  query: string
  nodeType: 'ALL' | 'DIRECTORY' | 'FILE'
  recursiveSearch: boolean
  // TODO file type filtering
}

export const SearchDefault: Search = {
  query: '',
  nodeType: 'ALL',
  recursiveSearch: false
}

export function selectedNodes(nodes: FsNode[], selection: FsNodeSelection) {
  if(selection.type === 'ALL')
    return nodes
  else if(selection.type === 'SOME')
    return nodes.filter((n) =>  selection.selectedElements.indexOf(n.id) >= 0)
  else
    return []
}

export function isNodeSelected(node: FsNode, selection: FsNodeSelection) {
  if(selection.type === 'ALL')
    return true
  else if(selection.type === 'SOME')
    return selection.selectedElements.indexOf(node.id) >= 0
  else
    return false
}

export default interface FsState {
  /** If the store is loading the current directory itself. This means that no directory can be displayed. */
  loadingCurrent: boolean
  /** If the store is loading contents for the current directory. The actuel content still can be showed. */
  loadingContent: boolean
  /** The current directory. Used for any action with the side bar. */
  current?: Directory
  /** The content of the current directory. Displayed and selectable. */
  content?: FsNode[]
  /** The maximum number of element in the current directory */
  contentSize?: number,
  /** List of selected elements */
  selectedContent: FsNodeSelection
  /** Search for the current directory */
  search?: Search
  /** If an error occured. */
  error?: ApiError
}

export const initialState: () => FsState =
  () => directoryWithContent ? {
    current: directoryWithContent.directory,
    content: directoryWithContent.content.items,
    contentSize: directoryWithContent.totalContentLength,
    loadingCurrent: false,
    loadingContent: false,
    selectedContent: { type: 'NONE' }
  } : {
    loadingCurrent: false,
    loadingContent: false,
    selectedContent: { type: 'NONE' }
  }