import { Epic } from 'redux-observable'
import { filter, map, flatMap } from 'rxjs/operators'

import { User } from '../../../models/User'
import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'

import { AuthenticationActions, TestSignedInAction, signedIn, notSignedIn } from './authenticationActions'
import GlobalState from '../../state'

type EpicType = Epic<AuthenticationActions, AuthenticationActions, GlobalState>

export const testSignedInEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: AuthenticationActions) => action.type === 'USER/AUTH/TEST_SIGNED_IN'),
    flatMap((_: TestSignedInAction) => {
      return Api.user.me()
    }),
    map((result: ApiError | User) => {
      if('errors' in result) {
        return notSignedIn(result)
      } else {
        return signedIn(result)
      }
    })
  )
