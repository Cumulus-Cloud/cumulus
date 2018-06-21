import { Action } from 'redux'
import { ActionCreator } from 'react-redux'


export interface ToggleDirectoryCreationPopupAction extends Action {
  type: 'POPUP/TOOGLE_DIRECTORY_CREATION'
  payload: {
    show: boolean
  }
}

export const toggleDirectoryCreationPopup: ActionCreator<ToggleDirectoryCreationPopupAction> =
  (show: boolean) => ({
    type: 'POPUP/TOOGLE_DIRECTORY_CREATION',
    payload: {
      show
    }
  })

  
export type PopupActions =
  ToggleDirectoryCreationPopupAction
