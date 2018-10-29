import { FsPopupType } from 'store/states/popupsState'
import { createAction, createPureAction } from 'store/actions'
import { FsNode } from 'models/FsNode';


export const showPopup = createAction<{ type: FsPopupType, nodes?: FsNode[] }>(({ type, nodes }, setState) => {
  setState({
    popups: {
      open: type,
      target: nodes || []
    }
  })
})

export const hidePopup = createPureAction((setState) => {
  setState(state => ({
    popups: {
      open: undefined,
      target: state.popups.target
    }
  }))
})
