import { Epic } from 'redux-observable'
import { filter, map, mergeMap } from 'rxjs/operators'

import { Directory } from './../../models/FsNode'
import Api from '../../services/api'
import { ApiError } from '../../models/ApiError'
import FsState from './fsState'
import { FsActions, GetDirectoryAction, getDirectorySuccess, getDirectoryFailure } from './fsActions'

import { push, routerActions } from 'connected-react-router'
import { AnyAction } from 'redux';

type EpicType = Epic<FsActions, FsActions, FsState>

export const getDirectoryEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: FsActions) => action.type === 'FS/GET_DIRECTORY'),
    mergeMap((action: GetDirectoryAction) => {
      const { path, contentOffset } = action.payload
      return Api.fs.getDirectory(path, contentOffset)
    }),
    map((result: ApiError | Directory) => {
      if('errors' in result) {
        return getDirectoryFailure(result)
      } else {
        return getDirectorySuccess(result)
      }
    })
  )
