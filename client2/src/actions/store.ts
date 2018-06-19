import { FsActions } from './fs/fsActions'
import { AuthenticationActions } from './user/auth/authenticationActions'
import { SignInActions } from './user/signIn/signInActions'
import { SignUpActions } from './user/signUp/signUpActions'

import { createStore, applyMiddleware, combineReducers } from 'redux'
import { createEpicMiddleware, combineEpics } from 'redux-observable'

import FsState from './fs/fsState'
import AuthenticationState from './user/auth/authenticationState'
import SignInState from './user/signIn/signInState'
import SignUpState from './user/signUp/signUpState'

import { getDirectoryEpic, createDirectoryEpic } from './fs/fsEpics'
import { testSignedInEpic } from './user/auth/authenticationEpics'
import { signInEpic, signInSuccessRedirectEpic } from './user/signIn/signInEpics'
import { signUpEpic, signUpSuccessRedirectEpic } from './user/signUp/signUpEpics'

import authenticationReducer from './user/auth/authenticationReducer'
import signInReducer from './user/signIn/signInReducer'
import signUpReducer from './user/signUp/signUpReducer'
import fsReducer from './fs/fsReducer'

import { createBrowserHistory } from 'history'
import GlobalState from './state'

import { connectRouter, routerMiddleware as createRouterMiddleware } from 'connected-react-router'

export const history = createBrowserHistory()

// Import all the epics and combine them
const fsEpics     = combineEpics<FsActions, FsActions, FsState>(getDirectoryEpic, createDirectoryEpic)
const authEpics   = combineEpics<AuthenticationActions, AuthenticationActions, AuthenticationState>(testSignedInEpic)
const signInEpics = combineEpics<SignInActions, SignInActions, SignInState>(signInEpic, signInSuccessRedirectEpic)
const signUpEpics = combineEpics<SignUpActions, SignUpActions, SignUpState>(signUpEpic, signUpSuccessRedirectEpic)

const allEpics = combineEpics(fsEpics, authEpics, signInEpics, signUpEpics)

// Combine all the reducers with a global state
const reducer = combineReducers<GlobalState>({
  auth: authenticationReducer,
  signIn: signInReducer,
  signUp: signUpReducer,
  fs: fsReducer
})

// Combine all the action types
type Actions = 
  AuthenticationActions |
  SignInActions |
  SignUpActions |
  FsActions

// Create an epic middleware for our epics
const epicMiddleware = createEpicMiddleware<Actions, Actions, GlobalState>()

const routerMiddleware = createRouterMiddleware(history)

// Create & export the global store
//const store = createStore<GlobalState, Actions, any, any>(reducer, applyMiddleware(epicMiddleware))

// Create & export the global store
const store = createStore<GlobalState, Actions, any, any>(
  connectRouter(history)(reducer), // new root reducer with router state
  applyMiddleware(routerMiddleware, epicMiddleware)
)

epicMiddleware.run(allEpics) // .. and don't forget to run the epics

export default store
