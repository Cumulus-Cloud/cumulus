import { togglePopup, PopupTypes } from './../actions/popup/popupActions'
import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import AppPage from './AppPage'
import { FsActions, getDirectory } from '../actions/fs/fsActions'
import GlobalState from '../actions/state'

function mapStateToProps(state: GlobalState) {
  return {}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppPage)) // TODO typing
