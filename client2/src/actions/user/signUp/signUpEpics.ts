import { Epic } from 'redux-observable'
import { filter, map, mergeMap } from 'rxjs/operators'
import { push } from 'connected-react-router'

import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'
import { SignUpActions, SignUpAction, SignUpSuccessAction, signUpFailure, signUpSuccess } from './signUpActions'
import SignUpState from './signUpState'
import Routes from '../../../services/routes'

type EpicType = Epic<SignUpActions, SignUpActions, SignUpState>

export const signUpEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignUpActions) => action.type === 'USER/SIGN_UP'),
    mergeMap((action: SignUpAction) => {
      const { login, email, password } = action.payload
      return Api.user.signUp(login, email, password)
    }),
    map((result: ApiError | User) => {
      if('errors' in result) {
        return signUpFailure(result)
      } else {
        return signUpSuccess(result)
      }
    })
  )

export const signUpSuccessRedirectEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignUpActions) => action.type === 'USER/SIGN_UP/SUCCESS'),
    map((_: SignUpSuccessAction) => {
      return push(Routes.auth.signInConfirmation)
    })
  )
