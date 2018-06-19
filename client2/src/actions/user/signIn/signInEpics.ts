import { Epic } from 'redux-observable'
import { filter, map, mergeMap } from 'rxjs/operators'
import { push } from 'connected-react-router'

import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'
import { SignInActions, SignInAction, SignInSuccessAction, signInFailure, signInSuccess } from './signInActions'
import SignInState from './signInState'
import Routes from '../../../services/routes'

type EpicType = Epic<SignInActions, SignInActions, SignInState>

export const signInEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignInActions) => action.type === 'USER/SIGN_IN'),
    mergeMap((action: SignInAction) => {
      const { login, password } = action.payload
      return Api.user.signIn(login, password)
    }),
    map((result: ApiError | User) => {
      if('errors' in result) {
        return signInFailure(result)
      } else {
        return signInSuccess(result)
      }
    })
  )

export const signInSuccessRedirectEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignInActions) => action.type === 'USER/SIGN_IN/SUCCESS'),
    map((_: SignInSuccessAction) => {
      return push(Routes.app.fs)
    })
  )
