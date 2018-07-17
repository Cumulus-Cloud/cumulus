import { Epic } from 'redux-observable'
import { filter, map, flatMap, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'

import { Directory } from './../../models/FsNode'
import Api from '../../services/api'
import { ApiError } from '../../models/ApiError'
import FsState from './fsState'
import { FsActions, GetDirectoryAction, GetDirectoryContentAction, getDirectorySuccess, getDirectoryFailure, getDirectoryContentSuccess, getDirectoryContentFailure } from './fsActions'

type EpicType = Epic<FsActions, FsActions, FsState>

export const getDirectoryEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: FsActions) => action.type === 'FS/GET_DIRECTORY'),
    mergeMap((action: GetDirectoryAction) => {
      const { path } = action.payload
      return Api.fs.getDirectory(path, 0)
    }),
    flatMap((result: ApiError | Directory) => {
      if('errors' in result)
        return of(getDirectoryFailure(result))
      else
        return concat(
          of(getDirectorySuccess(result)),
          of(getDirectoryContentSuccess(result.content))
        )
    })
  )

export const getDirectoryContentEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: FsActions) => action.type === 'FS/GET_DIRECTORY_CONTENT'),
    mergeMap((action: GetDirectoryContentAction) => {
      const path = $state.value.current ? $state.value.current.path : '/'
      const offset = $state.value.content ? $state.value.content.length : 0

      return Api.fs.getDirectory(path, offset)
    }),
    map((result: ApiError | Directory) => {
      if('errors' in result)
        return getDirectoryContentFailure(result)
      else
        return getDirectoryContentSuccess(result.content)
    })
  )