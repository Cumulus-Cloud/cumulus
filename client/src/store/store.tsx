import React from 'react'

import { createBrowserHistory, History } from 'history'

import { createStore as createContext } from 'utils/store'

import Routes from 'services/routes'

import { FsNode } from 'models/FsNode'

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

import { testUserAuth, signOutUser, signInUser, signUpUser } from 'store/actions/authentication'
import { getDirectory, getDirectoryContent, selectNode, deselectNode, search, selectAllNodes, deselectAllNodes } from 'store/actions/directory'
import { showNotification, hideNotification } from 'store/actions/notifications'
import { showPopup, hidePopup } from 'store/actions/popups'
import { selectUploadFile, deleteUploadFile, updateUploadFile, uploadAllFiles, hideUploadProgress, showUploadProgress } from 'store/actions/fileUpload'
import { createDirectory } from 'store/actions/directoryCreation'
import { deleteNodes } from 'store/actions/nodeDeletion'
import { moveNodes } from 'store/actions/nodeDisplacement'
import { getEvents } from 'store/actions/event'
import { toggleMenu, forceMenu } from 'store/actions/menu'


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
    showFs: (path: string) => state.router.push(`${Routes.app.fs}${path}${state.router.location.search}`),
    showEvents: () => state.router.push(Routes.app.events),
    showSignUp: () => state.router.push(Routes.auth.signUp),
    showSignIn: () => state.router.push(Routes.auth.signIn),
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
    signInUser: signInUser(ctx),
    signOutUser: signOutUser(ctx)
  }
}

export function useSignUp() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.signUp,
    signUpUser: signUpUser(ctx)
  }
}

export function useFilesystem() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.fs,
    initialPath: ctx.state.router.location.pathname.substring(7),
    getDirectory: getDirectory(ctx),
    getDirectoryContent: getDirectoryContent(ctx),
    selectNode: selectNode(ctx),
    deselectNode: deselectNode(ctx),
    selectAllNodes: selectAllNodes(ctx),
    deselectAllNodes: deselectAllNodes(ctx),
    search: search(ctx)
  }
}

export function useFileUpload() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.fileUpload,
    selectUploadFile: selectUploadFile(ctx),
    updateUploadFile: updateUploadFile(ctx),
    deleteUploadFile: deleteUploadFile(ctx),
    uploadAllFiles: uploadAllFiles(ctx),
    showUploadProgress: showUploadProgress(ctx),
    hideUploadProgress: hideUploadProgress(ctx),
  }
}

export function useDirectoryCreation() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.directoryCreation,
    createDirectory: createDirectory(ctx)
  }
}

export function useNodeDeletion() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.nodeDeletion,
    deleteNodes: deleteNodes(ctx)
  }
}

export function useNodeDisplacement() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.nodeDisplacement,
    moveNodes: moveNodes(ctx)
  }
}

export function useEvents() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.events,
    getEvents: getEvents(ctx)
  }
}

export function useMenu() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.menu,
    forceMenu: forceMenu(ctx),
    toggleMenu: toggleMenu(ctx)
  }
}

export function usePopups() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.popups,
    showPopup: showPopup(ctx),
    hidePopup: hidePopup(ctx),
    isPopupOpen: (popupType: FsPopupType) => ctx.state.popups.open === popupType
  }
}

export function useNotifications() {
  const ctx = React.useContext(Context)

  return {
    ...ctx.state.notifications,
    showNotification: showNotification(ctx),
    hideNotification: hideNotification(ctx)
  }
}
