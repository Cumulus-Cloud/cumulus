import React from 'react'

import Routes from 'services/routes'

import { FsNode } from 'models/FsNode'
import { EnrichedFile } from 'models/EnrichedFile'

import { Context } from 'store/store'
import { Search } from 'store/states/fsState'
import { FsPopupType } from 'store/states/popupsState'
import { showPopup, hidePopup } from 'store/actions/popups'
import { createDirectory } from 'store/actions/directoryCreation'
import { deleteNodes } from 'store/actions/nodeDeletion'
import { moveNodes } from 'store/actions/nodeDisplacement'
import { showNotification, hideNotification } from 'store/actions/notifications'
import { testUserAuth, signInUser, signUpUser, signOutUser } from 'store/actions/authentication'
import { getDirectory, selectNode, getDirectoryContent, selectAllNodes, deselectNode, deselectAllNodes, search } from 'store/actions/directory'
import { selectUploadFile, showUploadProgress, hideUploadProgress, uploadAllFiles, deleteUploadFile, updateUploadFile } from 'store/actions/fileUpload'


export function useRouting() {
  const store = React.useContext(Context)

  return {
    showFs: (path: string) => store.state.router.push(`${Routes.app.fs}${path}${store.state.router.location.search}`),
    showEvents: () => store.state.router.push(Routes.app.events),
    showSignUp: () => store.state.router.push(Routes.auth.signUp),
    showSignIn: () => store.state.router.push(Routes.auth.signIn)
  }
}

export function useAuthentication() {
  const store = React.useContext(Context)

  return {
    ...store.state.auth,
    testUserAuth: () => store.dispatch(testUserAuth()),
    signInUser: (login: string, password: string) => store.dispatch(signInUser({ login, password })),
    signOutUser: () => store.dispatch(signOutUser())
  }
}

export function useSignIn() {
  const store = React.useContext(Context)

  return {
    ...store.state.signIn,
    signInUser: (login: string, password: string) => store.dispatch(signInUser({ login, password })),
  }
}

export function useSignUp() {
  const store = React.useContext(Context)

  return {
    ...store.state.signUp,
    signUpUser: (login: string, email: string, password: string) => store.dispatch(signUpUser({ login, email, password })),
  }
}

export function useFilesystem() {
  const store = React.useContext(Context)

  return {
    ...store.state.fs,
    initialPath: store.state.router.location.pathname.substring(7),
    getDirectory: (path: string) => store.dispatch(getDirectory(path)),
    getDirectoryContent: () => store.dispatch(getDirectoryContent()),
    selectNode: (id: string) => store.dispatch(selectNode(id)),
    deselectNode: (id: string) => store.dispatch(deselectNode(id)),
    selectAllNodes: () => store.dispatch(selectAllNodes()),
    deselectAllNodes: () => store.dispatch(deselectAllNodes()),
    search: (s?: Search) => store.dispatch(search(s))
  }
}

export function useFileUpload() {
  const store = React.useContext(Context)

  return {
    ...store.state.fileUpload,
    selectUploadFile: (files: EnrichedFile[]) => store.dispatch(selectUploadFile(files)),
    updateUploadFile: (file: EnrichedFile) => store.dispatch(updateUploadFile(file)),
    deleteUploadFile: (file: EnrichedFile) => store.dispatch(deleteUploadFile(file)),
    uploadAllFiles: () => store.dispatch(uploadAllFiles()),
    showUploadProgress: () => store.dispatch(showUploadProgress()),
    hideUploadProgress: () => store.dispatch(hideUploadProgress())
  }
}

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
