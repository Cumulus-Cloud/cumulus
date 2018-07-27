import { connect, Dispatch } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import CreationPopup from './CreationPopup'
import GlobalState from '../../../actions/state'
import { createDirectory } from '../../../actions/fs/directoryCreation/createDirectoryActions'
import { togglePopup, isSelected } from '../../../actions/popup/popupActions'


function mapStateToProps(state: GlobalState) {
  const selection = isSelected('DIRECTORY_CREATION')(state.router.location)

  return {
    open: selection.selected,
    current: state.fs.current,
    loading: state.createDirectory.loading,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
  return {
    onClose: () => {
      dispatch(togglePopup('DIRECTORY_CREATION', false)(props.location))
    },
    onCreateDirectory: (path: string) => {
      dispatch(createDirectory(path))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreationPopup)) // TODO typing
