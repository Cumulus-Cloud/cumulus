import { ApiError } from './../../models/ApiError'
import { Directory, FsNode } from './../../models/FsNode'

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

export default interface FsState {
  /** If the store is loading the current directory itself. This means that no directory can be displayed. */
  loadingCurrent: boolean
  /** If the store is loading contents for the current directory. The actuel content still can be showed. */
  loadingContent: boolean
  /** The current directory. Used for any action with the side bar. */
  current?: Directory
  /** The content of the current directory. Displayed and selectable. */
  content?: FsNode[]
  /** List of selected elements */
  selectedContent: FsNodeSelection
  /** Detailed node */
  detailed?: FsNode
  /** If an error occured. */
  error?: ApiError
}
