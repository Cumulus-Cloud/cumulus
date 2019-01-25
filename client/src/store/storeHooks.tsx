import React from 'react'

import Routes from 'services/routes'
import { createBrowserHistory, History } from 'history'

import { createStore as createContext } from 'utils/store'

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
import { testUserAuth, signOutUser, signInUser, signUpUser } from './actions/authentication';
import { getDirectory, getDirectoryContent, selectNode, deselectNode, search, selectAllNodes, deselectAllNodes } from './actions/directory';


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


export const [Context, Provider] = createContext(initialState)

export function useRouting() {
  const { state } = React.useContext(Context)

  const push = (path: string) => {
    state.router.push(path)
  }

  return {
    router: state.router,
    push
  }
}

export function useAuthentication() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.auth,
    testUserAuth: testUserAuth(ctx),
    signOutUser: signOutUser(ctx)
  }
}

export function useSignIn() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.signIn,
    singInUser: signInUser(ctx),
    signOutUser: signOutUser(ctx)
  }
}

export function useSignUp() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.signUp,
    singInUser: signUpUser(ctx)
  }
}

export function useFilesystem() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.fs,
    getDirectory: getDirectory(ctx),
    getDirectoryContent: getDirectoryContent(ctx),
    selectNode: selectNode(ctx),
    deselectNode: deselectNode(ctx),
    selectAllNodes: selectAllNodes(ctx),
    deselectAllNodes: deselectAllNodes(ctx),
    search: search(ctx)
  }
}

// TODO le reste en dessous....

export const [FilesUploadContext, FilesUploadProvider] = createContext(initialFileUploadState())

export function useFileUpload() {
  const store = React.useContext(FilesUploadContext)

  return {
    ...store,
    selectUploadFile: (files: EnrichedFile[]) => {},
    updateUploadFile: (file: EnrichedFile) => {},
    deleteUploadFile: (file: EnrichedFile) => {},
    uploadAllFiles: () => {},
    showUploadProgress: () => {},
    hideUploadProgress: () => {},
  }
}

// TODO...

export function useDirectoryCreation() {
  const store = React.useContext(Context)

  return {
    ...store.state.directoryCreation,
    createDirectory: (path: string) => store.dispatch(createDirectory(path))
  }
}

export function useNodeDeletion() {
  const store = React.useContext(Context)

  return {
    ...store.state.nodeDeletion,
    deleteNodes: (nodes: FsNode[], deleteContent: boolean) => store.dispatch(deleteNodes({ nodes, deleteContent }))
  }
}

export function useNodeDisplacement() {
  const store = React.useContext(Context)

  return {
    ...store.state.nodeDisplacement,
    moveNodes: (nodes: FsNode[], destination: string) => store.dispatch(moveNodes({ nodes, destination }))
  }
}

export function usePopups() {
  const store = React.useContext(Context)

  return {
    ...store.state.popups,
    showPopup: (type: FsPopupType, nodes?: FsNode[]) => store.dispatch(showPopup({ type, nodes })),
    hidePopup: () => store.dispatch(hidePopup()),
    isPopupOpen: (popupType: FsPopupType) => store.state.popups.open === popupType
  }
}

export function useNotifications() {

  const store = React.useContext(Context)

  return {
    ...store.state.notifications,
    showNotification: (message: string) => store.dispatch(showNotification(message)),
    hideNotification: (id: string) => store.dispatch(hideNotification(id))
  }
}
*/
