import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'

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

export interface SignInSuccessAction extends Action {
  type: 'USER/SIGN_IN/SUCCESS'
  payload: {
    user: User
  }
}
  
export const signInSuccess: ActionCreator<SignInSuccessAction> =
  (user: User) => ({
    type: 'USER/SIGN_IN/SUCCESS',
    payload: {
      user
    }
  })

export interface SignInFailureAction extends Action {
  type: 'USER/SIGN_IN/FAILURE'
  payload: {
    error: ApiError
  }
}
  
export const signInFailure: ActionCreator<SignInFailureAction> =
  (error: ApiError) => ({
    type: 'USER/SIGN_IN/FAILURE',
    payload: {
      error
    }
  })

export type SignInActions =
  SignInAction |
  SignInSuccessAction |
  SignInFailureAction
