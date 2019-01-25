import { FsNode } from 'models/FsNode'

import { ContextState } from 'utils/store'

import { FsPopupType } from 'store/states/popupsState'
import { State } from 'store/store'


export const showPopup = ({ setState }: ContextState<State>) => (type: FsPopupType, nodes?: FsNode[]) => {
  setState({
    popups: {
      open: type,
      target: nodes || []
    }
  })
}

export const hidePopup = ({ setState }: ContextState<State>) => () => {
  setState(state => ({
    popups: {
      open: undefined,
      target: state.popups.target
    }
  }))
}
