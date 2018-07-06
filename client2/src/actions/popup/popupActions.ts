import { Action } from 'redux'
import { ActionCreator } from 'react-redux'

export type PopupType = 'DIRECTORY_CREATION' | 'FILE_UPLOAD' | 'FILE_UPLOAD_PROGRESS'

export const PopupTypes = {
  directoryCreation: 'DIRECTORY_CREATION',
  fileUpload: 'FILE_UPLOAD',
  fileUploadProgress: 'FILE_UPLOAD_PROGRESS'
}

export interface TogglePopupAction extends Action {
  type: 'POPUP/TOOGLE'
  payload: {
    type: PopupType
    show: boolean
  }
}

export const togglePopup: ActionCreator<TogglePopupAction> =
  (type: PopupType, show: boolean) => ({
    type: 'POPUP/TOOGLE',
    payload: {
      type,
      show
    }
  })

  
export type PopupActions =
  TogglePopupAction
