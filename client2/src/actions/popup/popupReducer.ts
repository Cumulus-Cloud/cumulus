import { Reducer } from 'redux'

import { PopupActions } from './popupActions'
import PopupState from './popupState'

const initialState: PopupState = {
  directoryCreation: false
}

const reducer: Reducer<PopupState, PopupActions> = (state: PopupState = initialState, action: PopupActions) => {
  switch(action.type) {
    case 'POPUP/TOOGLE_DIRECTORY_CREATION':
      return { ...state, directoryCreation: action.payload.show }
    default:
      return state
  }
}

export default reducer