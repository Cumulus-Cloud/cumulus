import { Epic } from "redux-observable"
import { filter, map, mergeMap } from "rxjs/operators"

import { User } from '../models/User'
import Api from '../services/api'
import { ApiError } from './../models/ApiError'
import { SignInAction, signInFailure, signInSuccess, UserActions, SignUpAction, signUpSuccess, signUpFailure } from './userActions'
import UserState from "./userState"

type EpicType = Epic<UserActions, UserActions, UserState>

export const signInEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: UserActions) => action.type === 'USER/SIGN_IN'),
    mergeMap((action: SignInAction) => {
      const { login, password } = action.payload
      return Api.signIn(login, password)
    }),
    map((result: ApiError | User) => {
      if('errors' in result) {
        return signInFailure(result)
      } else {
        return signInSuccess(result)
      }
    })
  )

export const signUpEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: UserActions) => action.type === 'USER/SIGN_UP'),
    mergeMap((action: SignUpAction) => {
      const { login, email, password } = action.payload
      return Api.signUp(login, email, password)
    }),
    map((result: ApiError | User) => {
      if('errors' in result) {
        return signUpFailure(result)
      } else {
        return signUpSuccess(result)
      }
    })
  )
