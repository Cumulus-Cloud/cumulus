import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import CreationPopup from './CreationPopup'
import GlobalState from '../../../actions/state'
import { createDirectory } from '../../../actions/fs/directoryCreation/createDirectoryActions'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'

function mapStateToProps(state: GlobalState) {
  return {
    open: state.popup.DIRECTORY_CREATION,
    current: state.fs.current,
    loading: state.createDirectory.loading,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onClose: () => {
      dispatch(togglePopup(PopupTypes.directoryCreation, false))
    },
    onCreateDirectory: (path: string) => {
      dispatch(createDirectory(path))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreationPopup)) // TODO typing
