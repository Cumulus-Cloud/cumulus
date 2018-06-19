import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'

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
  type: 'USER/SIGN_UP/SUCCESS'
  payload: {
    user: User
  }
}
  
export const signUpSuccess: ActionCreator<SignUpSuccessAction> =
  (user: User) => ({
    type: 'USER/SIGN_UP/SUCCESS',
    payload: {
      user
    }
  })

export interface SignUpFailureAction extends Action {
  type: 'USER/SIGN_UP/FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const signUpFailure: ActionCreator<SignUpFailureAction> =
  (error: ApiError) => ({
    type: 'USER/SIGN_UP/FAILURE',
    payload: {
      error
    }
  })


export type SignUpActions =
  SignUpAction |
  SignUpSuccessAction |
  SignUpFailureAction
