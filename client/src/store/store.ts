import { createBrowserHistory, History } from 'history'

import { createStore, Dispatcher } from 'utils/store'

import AuthenticationState, { initialState as initialAuthState } from 'store/states/authenticationState'
import SignInState from 'store/states/signInState'
import SignUpState from 'store/states/signUpState'
import FsState, { initialState as initialFsState } from 'store/states/fsState'
import EventState from 'store/states/eventState'
import DirectoryCreationState from 'store/states/directoryCreationState'
import NodeDisplacementState from 'store/states/nodeDisplacementState'
import NodeDeletionState from 'store/states/nodeDeletionState'
import FileUploadState, { initialState as initialFileUploadState } from 'store/states/fileUploadState'
import NotificationsState, { initialState as initialNotificationsState } from 'store/states/notificationsState'
import PopupsState, { initialState as initialPopupsState, FsPopupType } from 'store/states/popupsState'
import Menu from 'store/states/menuState'
import { FsNode } from 'models/FsNode'


export type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  events: EventState
  directoryCreation: DirectoryCreationState
  nodeDisplacement: NodeDisplacementState
  nodeDeletion: NodeDeletionState
  fileUpload: FileUploadState
  notifications: NotificationsState
  // TODO other store for UI info ?
  popups: PopupsState<FsPopupType, FsNode[]>
  menu: Menu,
  router: History
}

export const initialState: State = {
  auth: initialAuthState(),
  signIn: { loading: false },
  signUp: { loading: false },
  fs: initialFsState(),
  events: { loading: false, hasMore: true },
  directoryCreation: { loading: false },
  nodeDisplacement: { loading: false },
  nodeDeletion: { loading: false },
  fileUpload: initialFileUploadState(),
  notifications: initialNotificationsState(),
  popups: initialPopupsState([]),
  menu: { show: false },
  router: createBrowserHistory()
}

// TODO rename
export const { Context, Store, withStore } = createStore<State>(initialState)

export const connect = <T>(mapping: (state: State, dispatch: Dispatcher<State>) => T) => ( mapping )
