import { Reducer, AnyAction } from 'redux'

import { PopupActions } from './popupActions'
import PopupState from './popupState'

const initialState: PopupState = {
  'DIRECTORY_CREATION': false,
  'FILE_UPLOAD' : false,
  'FILE_UPLOAD_PROGRESS' :false,
  'NODE_DETAILS': false
}

const reducer: Reducer<PopupState> = (state: PopupState = initialState, action: AnyAction) => {
  switch(action.type) {
    case 'POPUP/TOOGLE':
      return { ...state, [action.payload.type]: action.payload.show }
    default:
      return state
  }
}

export default reducer
