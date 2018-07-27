import { connect, Dispatch } from 'react-redux'

import UploadProgressPopup from './UploadProgressPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'
import { uploadFileHideProgress } from '../../../actions/fs/fileUpload/fileUploadActions';

function mapStateToProps(state: GlobalState) {
  return {
    open: state.fileUpload.showUploadInProgress,
    files: state.fileUpload.uploading
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    onClose: () => {
      dispatch(uploadFileHideProgress())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadProgressPopup)
