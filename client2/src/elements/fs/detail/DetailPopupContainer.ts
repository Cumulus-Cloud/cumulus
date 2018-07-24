import { connect, Dispatch } from 'react-redux'

import DetailPopup from './DetailPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'

function mapStateToProps(state: GlobalState) {
  return {
    open: state.popup.NODE_DETAILS && !!state.fs.detailed,
    loading: state.createDirectory.loading,
    node: state.fs.detailed,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onClose: () => {
      dispatch(togglePopup(PopupTypes.nodeDetails, false))
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailPopup)
