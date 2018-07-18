import { Epic } from 'redux-observable'
import { filter, flatMap } from 'rxjs/operators'
import { push } from 'connected-react-router'
import { of, concat } from 'rxjs'

import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { User } from '../../../models/User'
import { SignUpActions, SignUpAction, signUpFailure, signUpSuccess } from './signUpActions'
import Routes from '../../../services/routes'
import GlobalState from '../../state';

type EpicType = Epic<SignUpActions, SignUpActions, GlobalState>

export const signUpEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: SignUpActions) => action.type === 'USER/SIGN_UP'),
    flatMap((action: SignUpAction) => {
      const { login, email, password } = action.payload
      return Api.user.signUp(login, email, password)
    }),
    flatMap((result: ApiError | User) => {
      if('errors' in result) {
        return of(signUpFailure(result))
      } else {
        return concat(
          of(signUpSuccess(result)),
          of(push(Routes.auth.signInConfirmation)) // TODO do in other epic
        )
      }
    })
  )
