import { Epic } from 'redux-observable'
import { filter, map, flatMap, mergeMap } from 'rxjs/operators'
import { concat, of } from 'rxjs'

import { Directory, DirectoryWithContent } from './../../models/FsNode'
import Api from '../../services/api'
import { ApiError } from '../../models/ApiError'
import { FsActions, GetDirectoryAction, GetDirectoryContentAction, getDirectorySuccess, getDirectoryFailure, getDirectoryContentSuccess, getDirectoryContentFailure, getDirectoryContent } from './fsActions'
import GlobalState from '../state'

type EpicType = Epic<FsActions, FsActions, GlobalState>

export const getDirectoryEpic: EpicType = (action$) =>
  action$.pipe(
    filter((action: FsActions) => action.type === 'FS/GET_DIRECTORY'),
    mergeMap((action: GetDirectoryAction) => {
      const { path } = action.payload
      return Api.fs.getDirectory(path)
    }),
    flatMap((result: ApiError | Directory) => {
      if('errors' in result)
        return of(getDirectoryFailure(result))
      else
        return concat(of(getDirectorySuccess(result), getDirectoryContent(0)))
    })
  )

export const getDirectoryContentEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: FsActions) => action.type === 'FS/GET_DIRECTORY_CONTENT'),
    mergeMap((_: GetDirectoryContentAction) => {
      const id = $state.value.fs.current ? $state.value.fs.current.id : ''
      const offset = $state.value.fs.content ? $state.value.fs.content.length : 0

      return Api.fs.getContent(id, offset)
    }),
    map((result: ApiError | DirectoryWithContent) => {
      console.log(result)
      if('errors' in result)
        return getDirectoryContentFailure(result)
      else
        return getDirectoryContentSuccess(result.content.items, result.totalContentLength)
    })
  )
