import { Epic } from 'redux-observable'
import { filter, map, flatMap, mergeMap } from 'rxjs/operators'
import { push } from 'connected-react-router'
import { of, concat } from 'rxjs'

import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'
import { SignInActions, SignInAction, signInFailure, signInSuccess } from './signInActions'
import SignInState from './signInState'
import Routes from '../../../services/routes'
import { signedIn } from '../auth/authenticationActions'

type EpicType = Epic<SignInActions, SignInActions, SignInState>

export const signInEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignInActions) => action.type === 'USER/SIGN_IN'),
    mergeMap((action: SignInAction) => {
      const { login, password } = action.payload
      return Api.user.signIn(login, password)
    }),
    flatMap((result: ApiError | User) => {
      if('errors' in result) {
        return of(signInFailure(result))
      } else {
        return concat(
          of(signedIn(result)),
          of(signInSuccess(result)),
          of(push(`${Routes.app.fs}/`))
        )
      }
    })
  )

