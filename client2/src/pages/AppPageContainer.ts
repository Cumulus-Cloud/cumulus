import { togglePopup } from './../actions/popup/popupActions'
import { connect, Dispatch } from 'react-redux'

import AppPage from './AppPage'
import GlobalState from '../actions/state'
import { withRouter, RouteComponentProps } from 'react-router'

function mapStateToProps(state: GlobalState) {
  const content = state.fs.content || []
  const selection = state.fs.selectedContent

  return {
    selection:
      selection.type === 'ALL' ? content : (selection.type === 'NONE' ? [] : content.filter((node) => selection.selectedElements.indexOf(node.id) >= 0)),
    user: state.auth.user
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
  return {
    showCreationPopup: () => {
      dispatch(togglePopup('DIRECTORY_CREATION', true)(props.location))
    },
    showUploadPopup: () => {
      dispatch(togglePopup('FILE_UPLOAD', true)(props.location))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppPage))
