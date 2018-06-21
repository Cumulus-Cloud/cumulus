import { Epic } from 'redux-observable'
import { filter, flatMap, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'

import { Directory } from './../../../models/FsNode'
import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { CreateDirectoryActions, CreateDirectoryAction, createDirectoryFailure, createDirectorySuccess, CreateDirectorySuccessAction } from './createDirectoryActions'
import { getDirectory } from '../fsActions'
import GlobalState from '../../state';
import { toggleDirectoryCreationPopup } from '../../popup/popupActions';

type EpicType = Epic<CreateDirectoryActions, CreateDirectoryActions, GlobalState>

export const createDirectoryEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: CreateDirectoryActions) => action.type === 'FS/CREATE_DIRECTORY'),
    mergeMap((action: CreateDirectoryAction) => {
      const { path } = action.payload
      return Api.fs.createDirectory(path)
    }),
    flatMap((result: ApiError | Directory) => {
      if('errors' in result) {
        return of(createDirectoryFailure(result))
      } else {
        const currentPath = $state.value.fs.current ? $state.value.fs.current.path : ''
        return concat(
          of(createDirectorySuccess(result)),
          of(getDirectory(currentPath)), // Reload the current directory
          of(toggleDirectoryCreationPopup(false)) // Close the popup
        )
      }
    })
  )
