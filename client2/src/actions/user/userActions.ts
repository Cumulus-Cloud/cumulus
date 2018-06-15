import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

import { ApiError } from '../../models/ApiError'
import { User } from '../../models/User'

/**
 * Test the connection of the current user (if any). Will fire a 'SignedInAction'
 * is the user is signed in, or a 'NotSignedInAction' if the current user is not
 * signed in.
 */
export interface TestSignedInAction extends Action {
  type: 'USER/TEST_SIGNED_IN'
  payload: {}
}

export const testSignedIn: ActionCreator<TestSignedInAction> =
  () => ({
    type: 'USER/TEST_SIGNED_IN',
    payload: {}
  })

/**
 * Dispatched after a 'TestSignedInAction' if an user is signed in.
 */
export interface SignedInAction extends Action {
  type: 'USER/SIGNED_IN'
  payload: {
    user: User
  }
}

export const signedIn: ActionCreator<SignedInAction> =
  (user: User) => ({
    type: 'USER/SIGNED_IN',
    payload: {
      user,
    }
  })

/**
 * Dispatched after a 'TestSignedInAction' if an user is not signed in.
 */
export interface NotSignedInAction extends Action {
  type: 'USER/NOT_SIGNED_IN'
  payload: {}
}
  
export const notSignedIn: ActionCreator<NotSignedInAction> =
  () => ({
    type: 'USER/NOT_SIGNED_IN',
    payload: {}
  })

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
    user: User
  }
}
  
export const signUpSuccess: ActionCreator<SignUpSuccessAction> =
  (user: User) => ({
    type: 'USER/SIGN_UP_SUCCESS',
    payload: {
      user
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
  TestSignedInAction |
  SignedInAction |
  NotSignedInAction |
  SignInAction |
  SignInSuccessAction |
  SignInFailureAction |
  SignUpAction |
  SignUpSuccessAction |
  SignUpFailureAction
