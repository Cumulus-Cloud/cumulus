import { PopupTypes } from './../../popup/popupActions'
import { Epic } from 'redux-observable'
import { filter, flatMap, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'

import { Directory } from './../../../models/FsNode'
import Api from '../../../services/api'
import { ApiError } from '../../../models/ApiError'
import { CreateDirectoryActions, CreateDirectoryAction, createDirectoryFailure, createDirectorySuccess, CreateDirectorySuccessAction } from './createDirectoryActions'
import { getDirectory } from '../fsActions'
import GlobalState from '../../state';
import { togglePopup } from '../../popup/popupActions'
import { showSnakebar } from '../../snackbar/snackbarActions';

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
          of(getDirectory(currentPath)),                              // Reload the current directory
          of(togglePopup(PopupTypes.directoryCreation, false)),       // Close the popup
          of(showSnakebar(`Dossier « ${result.name} » créé avec succès`)), // Show a snakebar
          of(showSnakebar(`Dossier « ${result.name} » créé avec succès2`)), // Show a snakebar
          of(showSnakebar(`Dossier « ${result.name} » créé avec succès3`)), // Show a snakebar
          of(showSnakebar(`Dossier « ${result.name} » créé avec succès4`)) // Show a snakebar
        )
      }
    })
  )
