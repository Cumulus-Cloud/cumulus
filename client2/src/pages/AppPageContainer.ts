import { toggleDirectoryCreationPopup } from './../actions/popup/popupActions'
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
      dispatch(toggleDirectoryCreationPopup(true))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppPage)) // TODO typing
