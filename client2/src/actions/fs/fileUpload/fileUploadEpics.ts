import { FileUploadActions, UploadAllFilesAction, uploadFile, uploadFileFailure, uploadFileProgess, uploadFileSuccess, UploadFileAction, UploadFileSuccessAction } from './fileUploadActions'
import { AnyAction } from 'redux'
import { Epic } from 'redux-observable'
import { filter, flatMap, mergeMap } from 'rxjs/operators'
import { of, concat, Observable, Observer } from 'rxjs'

import Api from '../../../services/api'
import GlobalState from '../../state'
import { ApiError } from '../../../models/ApiError'
import { PopupTypes, togglePopup } from './../../popup/popupActions'
import { showSnakebar } from '../../snackbar/snackbarActions'
import { getDirectory } from '../fsActions'

type EpicType = Epic<AnyAction, AnyAction, GlobalState>

export const uploadAllFilesEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: FileUploadActions) => action.type === 'FS/UPLOAD_ALL_FILES'),
    flatMap((_: UploadAllFilesAction) => {
      const files = $state.value.fileUpload.files

      return files
        .map((f) => uploadFile(f) as AnyAction)
        .concat([ togglePopup('FILE_UPLOAD', false)($state.value.router.location) ])
    })
  )


export const uploadFileEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: FileUploadActions) => action.type === 'FS/UPLOAD_FILE'),
    mergeMap((action: UploadFileAction) => {
      const file = action.payload.file

      // Start the upload
      const upload = Observable.create((observer: Observer<FileUploadActions>) => {
        const onProgress = (progress: number) => {
          observer.next(uploadFileProgess(file, progress))
        }

        Api.fs.uploadFile(file, onProgress)
          .then((result: ApiError | any) => {
            if('errors' in result) {
              observer.next(uploadFileFailure(file, result))
              observer.complete()
            } else {
              observer.next(uploadFileSuccess(file, result)) // TODO use result ?
              observer.complete()
            }
          })
          .catch((e) => {
            // TODO handle error better ?
            observer.next(uploadFileFailure(file, e)) // TODO e format is not what we expect
            observer.complete()
          })
      })

      return concat(
        of(togglePopup('FILE_UPLOAD', true)($state.value.router.location)), // Show the upload progress popup
        upload
      )
    })
  )

export const uploadFileSuccessEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: FileUploadActions) => action.type === 'FS/UPLOAD_FILE/SUCCESS'),
    mergeMap((action: UploadFileSuccessAction) => {
      const currentPath = $state.value.fs.current ? $state.value.fs.current.path : '/'
      const filename = action.payload.file.filename

      return concat(
        // of(getDirectory(currentPath)),                                       // Reload the current directory
        of(showSnakebar(`Fichier « ${filename} » mis en ligne avec succès`)) // Show a snakebar
      )
    })
  )