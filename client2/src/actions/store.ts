import { User } from '../models/User'
import { UserActions } from '../actions/userActions'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, combineEpics, EpicMiddleware } from 'redux-observable'
import { signInEpic, signUpEpic } from '../actions/userEpics'
import UserState from '../actions/userState';
import userReducer from '../actions/userReducer';

const userEpics = combineEpics<UserActions, UserActions, UserState>(signInEpic, signUpEpic)

const epicMiddleware = createEpicMiddleware<UserActions, UserActions, UserState>()

export const store = createStore<UserState, UserActions, any, any>(userReducer, applyMiddleware(epicMiddleware))

epicMiddleware.run(userEpics)
