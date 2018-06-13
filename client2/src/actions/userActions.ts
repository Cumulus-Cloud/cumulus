import { Action } from 'redux'
import { ActionCreator } from 'react-redux'
import {ThunkAction, ThunkDispatch} from 'redux-thunk'

import UserState from './userState'
import { ApiError } from '../models/ApiError'
import { User } from '../models/User'


export interface SignInAction extends Action {
  type: 'USER/SIGN_IN'
  payload: {
    login: string,
    password: string
  }
}

export const signIn: ActionCreator<SignInAction> =
  (login: string, password: string) => ({
    type: 'USER/SIGN_IN',
    payload: {
      login,
      password
    }
  })

// TODO test that it work
const signInTest: ActionCreator<ThunkAction<Promise<UserActions>, UserState, null, UserActions>> =
  (login: string, password: string) =>
    (dispatch: ThunkDispatch<null, UserState, UserActions>, getState: () =>  UserState) => {
      dispatch(signIn(login, password))
      
      return fetch(`https://www.reddit.com/r/test.json`)
      .then(
        response => response.json(),
        error => console.log('An error occurred.', error)
      )
      .then(json => dispatch(signInSuccess({ id: '1', login: 'vuzi', creation: '', roles: ['user', 'admin']  })))
    }

// TODO add the redux store to the login page

export interface SignInSuccessAction extends Action {
  type: 'USER/SIGN_IN_SUCCESS'
  payload: {
    user: User
  }
}
  
export const signInSuccess: ActionCreator<SignInSuccessAction> =
  (user: User) => ({
    type: 'USER/SIGN_IN_SUCCESS',
    payload: {
      user
    }
  })

export interface SignInFailureAction extends Action {
  type: 'USER/SIGN_IN_FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const signInFailure: ActionCreator<SignInFailureAction> =
  (error: ApiError) => ({
    type: 'USER/SIGN_IN_FAILURE',
    payload: {
      error
    }
  })

export interface SignUpAction extends Action {
  type: 'USER/SIGN_UP'
  payload: {
    login: string,
    email: string,
    password: string
  }
}

export const signUp: ActionCreator<SignUpAction> =
  (login: string, email: string, password: string) => ({
    type: 'USER/SIGN_UP',
    payload: {
      login,
      email,
      password
    }
  })

export interface SignUpSuccessAction extends Action {
  type: 'USER/SIGN_UP_SUCCESS'
  payload: {
    user: User // TODO see what is send
  }
}
  
export const signUpSuccess: ActionCreator<SignUpSuccessAction> =
  (user: User) => ({
    type: 'USER/SIGN_UP_SUCCESS',
    payload: {
      user // TODO see what is send
    }
  })

export interface SignUpFailureAction extends Action {
  type: 'USER/SIGN_UP_FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const signUpFailure: ActionCreator<SignUpFailureAction> =
  (error: ApiError) => ({
    type: 'USER/SIGN_UP_FAILURE',
    payload: {
      error
    }
  })


export type UserActions =
  SignInAction |
  SignInSuccessAction |
  SignInFailureAction |
  SignUpAction |
  SignUpSuccessAction |
  SignUpFailureAction