import { Epic } from 'redux-observable'
import { filter, flatMap } from 'rxjs/operators'
import { push } from 'connected-react-router'
import { of, concat } from 'rxjs'

import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'
import { SignInActions, SignInAction, signInFailure, signInSuccess } from './signInActions'
import Routes from '../../../services/routes'
import { signedIn } from '../auth/authenticationActions'
import GlobalState from '../../state'

type EpicType = Epic<SignInActions, SignInActions, GlobalState>

export const signInEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignInActions) => action.type === 'USER/SIGN_IN'),
    flatMap((action: SignInAction) => {
      const { login, password } = action.payload
      return Api.user.signIn(login, password)
    }),
    flatMap((result: ApiError | User) => {
      if('errors' in result) {
        return of(signInFailure(result))
      } else {
        return concat(
          of(signedIn(result)),
          of(signInSuccess(result)), // TODO do in other epic
          of(push(`${Routes.app.fs}/`))
        )
      }
    })
  )

