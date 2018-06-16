import { FsActions } from './fs/fsActions'
import { UserActions } from './user/userActions'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { createEpicMiddleware, combineEpics } from 'redux-observable'
import FsState from './fs/fsState'

import { getDirectoryEpic, createDirectoryEpic } from './fs/fsEpics'
import { testSignedInEpic, signInEpic, signUpEpic } from './user/userEpics'
import fsReducer from './fs/fsReducer'
import userReducer from './user/userReducer'
import UserState from './user/userState'
import GlobalState from './state'

// Import all the epics and combine them
const fsEpics  = combineEpics<FsActions, FsActions, FsState>(getDirectoryEpic, createDirectoryEpic)
const userEpics = combineEpics<UserActions, UserActions, UserState>(testSignedInEpic, signInEpic, signUpEpic)

const allEpics = combineEpics(fsEpics, userEpics)

// Combine all the reducers with a global state
const reducer = combineReducers<GlobalState>({
  user: userReducer,
  fs: fsReducer
})

// Combine all the action types
type Actions = 
  UserActions |
  FsActions

// Create an epic middleware for our epics
const epicMiddleware = createEpicMiddleware<Actions, Actions, GlobalState>()

// Create & export the global store
const store = createStore<GlobalState, Actions, any, any>(reducer, applyMiddleware(epicMiddleware))

epicMiddleware.run(allEpics) // .. and don't forget to run the epics

export default store
