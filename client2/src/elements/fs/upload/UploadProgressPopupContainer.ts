import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import UploadProgressPopup from './UploadProgressPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'

function mapStateToProps(state: GlobalState) {
  return {
    open: state.popup.FILE_UPLOAD_PROGRESS,
    files: state.fileUpload.uploading
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onClose: () => {
      dispatch(togglePopup(PopupTypes.fileUploadProgress, false))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadProgressPopup)) // TODO typing
