import { PopupType } from 'store/states/popupsState'
import { createAction, createPureAction } from 'store/actions'


export const showPopup = createAction<PopupType>((popup, setState) => {
  setState({
    popups: {
      open: popup
    }
  })
})

export const hidePopup = createPureAction((setState) => {
  setState({
    popups: {
      open: undefined
    }
  })
})
