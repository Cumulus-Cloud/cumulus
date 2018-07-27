import { connect, Dispatch } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import DetailPopup from './DetailPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, isSelected } from '../../../actions/popup/popupActions'


function mapStateToProps(state: GlobalState) {
  const selection = isSelected('NODE_DETAILS')(state.router.location)

  // TODO handle pagination (ask for specific file reload)
  const node = state.fs.detailed || (state.fs.content || []).find((n) => n.name === selection.param)

  return {
    open: selection.selected && !!node,
    loading: state.createDirectory.loading,
    node: node,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
  return {
    onClose: () => {
      dispatch(togglePopup('NODE_DETAILS', false)(props.location))
    },
    
    onDownload: () => {
      console.log('TODO onDownload')
    },
    onDelete: () => {
      console.log('TODO onDelete')
    },
    onShare: () => {
      console.log('TODO onDownload')
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DetailPopup)) // TODO fix typing
