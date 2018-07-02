import { FileUploadActions, UploadAllFilesAction, uploadFile, uploadFileFailure, uploadFileProgess, uploadFileSuccess, UploadFileAction } from './fileUploadActions'
import { PopupTypes, togglePopup } from './../../popup/popupActions'
import { Epic } from 'redux-observable'
import { filter, flatMap, mergeMap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax';
import { of, concat, Subject, Observable, Subscriber, Observer } from 'rxjs'

import Api from '../../../services/api'
import GlobalState from '../../state'
import { ApiError } from '../../../models/ApiError';
import { getDirectory } from '../fsActions';
import { AnyAction } from 'redux';

type EpicType = Epic<AnyAction, AnyAction, GlobalState>

export const uploadAllFilesEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: UploadAllFilesAction) => action.type === 'FS/UPLOAD_ALL_FILES'),
    flatMap((_: UploadAllFilesAction) => {
      const files = $state.value.fileUpload.files
      console.log('Starting uploads')

      return files
        .map((f) => uploadFile(f) as AnyAction)
        .concat([ togglePopup(PopupTypes.fileUpload, false) ])
    })
  )


export const uploadFileEpic: EpicType = (action$, $state) =>
  action$.pipe(
    filter((action: UploadFileAction) => action.type === 'FS/UPLOAD_FILE'),
    mergeMap((action: UploadFileAction) => {
      const file = action.payload.file
      console.log('Starting upload')

      return Observable.create((observer: Observer<FileUploadActions>) => {
        const onProgress = (progress: number) => {
          console.log(progress)
          observer.next(uploadFileProgess(file, progress))
        }

        Api.fs.uploadFile(file, onProgress)
          .then((result: ApiError | any) => {
            if('errors' in result) {
              observer.next(uploadFileFailure(file, result))
              observer.complete()
            } else {
              const currentPath = $state.value.fs.current ? $state.value.fs.current.path : ''
              observer.next(uploadFileSuccess(file, result)) // TODO use result ?
              //observer.next(getDirectory(currentPath)) // Reload the current directory
              observer.complete()
            }
          })
          .catch((e) => {
            // TODO handle error
            observer.complete()
          })
      })
    })
  )
