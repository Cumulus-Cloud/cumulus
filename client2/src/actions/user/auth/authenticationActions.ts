import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

import { User } from '../../../models/User'

/**
 * Test the connection of the current user (if any). Will fire a 'SignedInAction'
 * is the user is signed in, or a 'NotSignedInAction' if the current user is not
 * signed in.
 */
export interface TestSignedInAction extends Action {
  type: 'USER/AUTH/TEST_SIGNED_IN'
  payload: {}
}

export const testSignedIn: ActionCreator<TestSignedInAction> =
  () => ({
    type: 'USER/AUTH/TEST_SIGNED_IN',
    payload: {}
  })

/**
 * Dispatched after a 'TestSignedInAction' if an user is signed in.
 */
export interface SignedInAction extends Action {
  type: 'USER/AUTH/SIGNED_IN'
  payload: {
    user: User
  }
}

export const signedIn: ActionCreator<SignedInAction> =
  (user: User) => ({
    type: 'USER/AUTH/SIGNED_IN',
    payload: {
      user
    }
  })

/**
 * Dispatched after a 'TestSignedInAction' if an user is not signed in.
 */
export interface NotSignedInAction extends Action {
  type: 'USER/AUTH/NOT_SIGNED_IN'
  payload: {}
}
  
export const notSignedIn: ActionCreator<NotSignedInAction> =
  () => ({
    type: 'USER/AUTH/NOT_SIGNED_IN',
    payload: {}
  })

export type AuthenticationActions =
  TestSignedInAction |
  SignedInAction |
  NotSignedInAction
