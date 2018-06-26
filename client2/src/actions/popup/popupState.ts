import { PopupType } from './popupActions'

type PopupState = {
  [K in PopupType]: boolean
}

export default PopupState
