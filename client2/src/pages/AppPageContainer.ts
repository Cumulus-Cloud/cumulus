import { togglePopup, PopupTypes } from './../actions/popup/popupActions'
import { connect, Dispatch } from 'react-redux'

import AppPage from './AppPage'
import GlobalState from '../actions/state'

function mapStateToProps(state: GlobalState) {
  const content = state.fs.content || []
  const selection = state.fs.selectedContent

  return {
    selection:
      selection.type === 'ALL' ? content : (selection.type === 'NONE' ? [] : content.filter((node) => selection.selectedElements.indexOf(node.id) >= 0)),
    user: state.auth.user
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    showCreationPopup: () => {
      dispatch(togglePopup(PopupTypes.directoryCreation, true))
    },
    showUploadPopup: () => {
      dispatch(togglePopup(PopupTypes.fileUpload, true))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppPage) // TODO typing
