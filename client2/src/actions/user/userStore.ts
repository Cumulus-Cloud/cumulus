import { createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, combineEpics, EpicMiddleware } from 'redux-observable'

import { UserActions } from '../../actions/user/userActions'
import { signInEpic, signUpEpic, testSignedInEpic } from '../../actions/user/userEpics'
import UserState from '../../actions/user/userState'
import userReducer from '../../actions/user/userReducer'

const userEpics = combineEpics<UserActions, UserActions, UserState>(testSignedInEpic, signInEpic, signUpEpic)

const epicMiddleware = createEpicMiddleware<UserActions, UserActions, UserState>()

export const store = createStore<UserState, UserActions, any, any>(userReducer, applyMiddleware(epicMiddleware))

epicMiddleware.run(userEpics)
