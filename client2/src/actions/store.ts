import { createStore, applyMiddleware, combineReducers } from 'redux'
import { createEpicMiddleware, combineEpics } from 'redux-observable'
import { createBrowserHistory } from 'history'

import { FileUploadActions } from './fs/fileUpload/fileUploadActions'
import { FsActions } from './fs/fsActions'
import { CreateDirectoryActions } from './fs/directoryCreation/createDirectoryActions'
import { AuthenticationActions } from './user/auth/authenticationActions'
import { SignInActions } from './user/signIn/signInActions'
import { SignUpActions } from './user/signUp/signUpActions'
import { PopupActions } from './popup/popupActions'
import { SnackbarActions } from './snackbar/snackbarActions'

import { getDirectoryEpic } from './fs/fsEpics'
import { createDirectoryEpic, createDirectorySuccessEpic } from './fs/directoryCreation/createDirectoryEpics'
import { uploadFileEpic, uploadAllFilesEpic, uploadFileSuccessEpic } from './fs/fileUpload/fileUploadEpics'
import { testSignedInEpic } from './user/auth/authenticationEpics'
import { signInEpic } from './user/signIn/signInEpics'
import { signUpEpic } from './user/signUp/signUpEpics'

import authenticationReducer from './user/auth/authenticationReducer'
import signInReducer from './user/signIn/signInReducer'
import signUpReducer from './user/signUp/signUpReducer'
import fsReducer from './fs/fsReducer'
import createDirectoryReducer from './fs/directoryCreation/createDirectoryReducer'
import fileUploadReducer from './fs/fileUpload/fileUploadReducer'
import popupReducer from './popup/popupReducer'
import snackbarReducer from './snackbar/snackbarReducer'

import GlobalState from './state'

import { connectRouter, routerMiddleware as createRouterMiddleware } from 'connected-react-router'

export const history = createBrowserHistory()

// Import all the epics and combine them

// FS epics
const fsEpics              = combineEpics(getDirectoryEpic)
const createDirectoryEpics = combineEpics(createDirectoryEpic, createDirectorySuccessEpic)
const uploadFileEpics      = combineEpics(uploadAllFilesEpic, uploadFileEpic, uploadFileSuccessEpic)
// delete fsNode
// upload file(s)
// download file
// share
// show sharings
// delete sharing
// search
// User epics
const authEpics   = combineEpics(testSignedInEpic)
const signInEpics = combineEpics(signInEpic)
const signUpEpics = combineEpics(signUpEpic)
// show sessions
// revoke session
// log out (revoke current session)
// Admin
// List users
// Create user
// Update user
// Revoker all user sessions

const allEpics = combineEpics(fsEpics, createDirectoryEpics, uploadFileEpics, authEpics, signInEpics, signUpEpics)

// Combine all the reducers with a global state
const reducer = combineReducers<GlobalState>({
  auth: authenticationReducer,
  signIn: signInReducer,
  signUp: signUpReducer,
  fs: fsReducer,
  createDirectory: createDirectoryReducer,
  fileUpload: fileUploadReducer,
  popup: popupReducer,
  snackbar: snackbarReducer
})

// Combine all the action types
type Actions = 
  AuthenticationActions |
  SignInActions |
  SignUpActions |
  FsActions |
  CreateDirectoryActions |
  FileUploadActions |
  PopupActions |
  SnackbarActions

// Create an epic middleware for our epics
const epicMiddleware = createEpicMiddleware<Actions, Actions, GlobalState>()

// Router middleware for the routing
const routerMiddleware = createRouterMiddleware(history)

// Create & export the global store
const store = createStore(
  connectRouter(history)(reducer), // new root reducer with router state
  applyMiddleware(routerMiddleware, epicMiddleware)
)

epicMiddleware.run(allEpics) // .. and don't forget to run the epics

export default store
