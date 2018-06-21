import { FsActions } from './fs/fsActions'
import { CreateDirectoryActions, createDirectory } from './fs/directoryCreation/createDirectoryActions'
import { AuthenticationActions } from './user/auth/authenticationActions'
import { SignInActions } from './user/signIn/signInActions'
import { SignUpActions } from './user/signUp/signUpActions'

import { createStore, applyMiddleware, combineReducers } from 'redux'
import { createEpicMiddleware, combineEpics } from 'redux-observable'

import FsState from './fs/fsState'
import CreateDirectoryState from './fs/directoryCreation/createDirectoryState'
import AuthenticationState from './user/auth/authenticationState'
import SignInState from './user/signIn/signInState'
import SignUpState from './user/signUp/signUpState'

import { getDirectoryEpic } from './fs/fsEpics'
import { createDirectoryEpic } from './fs/directoryCreation/createDirectoryEpics'
import { testSignedInEpic } from './user/auth/authenticationEpics'
import { signInEpic } from './user/signIn/signInEpics'
import { signUpEpic } from './user/signUp/signUpEpics'

import authenticationReducer from './user/auth/authenticationReducer'
import signInReducer from './user/signIn/signInReducer'
import signUpReducer from './user/signUp/signUpReducer'
import fsReducer from './fs/fsReducer'
import createDirectoryReducer from './fs/directoryCreation/createDirectoryReducer'
import popupReducer from './popup/popupReducer'

import { createBrowserHistory } from 'history'
import GlobalState from './state'

import { connectRouter, routerMiddleware as createRouterMiddleware } from 'connected-react-router'
import { PopupActions } from './popup/popupActions';

export const history = createBrowserHistory()

// Import all the epics and combine them

// FS expics
const fsEpics              = combineEpics<FsActions, FsActions, FsState>(getDirectoryEpic)
const createDirectoryEpics = combineEpics<CreateDirectoryActions, CreateDirectoryActions, GlobalState>(createDirectoryEpic)
// delete fsNode
// upload file(s)
// download file
// share
// show sharings
// delete sharing
// search
// User epics
const authEpics   = combineEpics<AuthenticationActions, AuthenticationActions, AuthenticationState>(testSignedInEpic)
const signInEpics = combineEpics<SignInActions, SignInActions, SignInState>(signInEpic)
const signUpEpics = combineEpics<SignUpActions, SignUpActions, SignUpState>(signUpEpic)
// show sessions
// revoke session
// log out (revoke current session)
// Admin
// List users
// Create user
// Update user
// Revoker all user sessions

const allEpics = combineEpics(fsEpics, createDirectoryEpics, authEpics, signInEpics, signUpEpics)

// Combine all the reducers with a global state
const reducer = combineReducers<GlobalState>({
  auth: authenticationReducer,
  signIn: signInReducer,
  signUp: signUpReducer,
  fs: fsReducer,
  createDirectory: createDirectoryReducer,
  popup: popupReducer
})

// Combine all the action types
type Actions = 
  AuthenticationActions |
  SignInActions |
  SignUpActions |
  FsActions |
  CreateDirectoryActions |
  PopupActions

// Create an epic middleware for our epics
const epicMiddleware = createEpicMiddleware<Actions, Actions, GlobalState>()

// Router middleware for the routing
const routerMiddleware = createRouterMiddleware(history)

// Create & export the global store
const store = createStore<GlobalState, Actions, any, any>(
  connectRouter(history)(reducer), // new root reducer with router state
  applyMiddleware(routerMiddleware, epicMiddleware)
)

epicMiddleware.run(allEpics) // .. and don't forget to run the epics

export default store
