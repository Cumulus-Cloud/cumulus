import { selectUploadFile, deleteUploadFile, updateUploadFile, uploadAllFiles } from './../../../actions/fs/fileUpload/fileUploadActions'
import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import UploadProgressPopup from './UploadProgressPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'
import { EnrichedFile } from '../../../models/EnrichedFile'

function mapStateToProps(state: GlobalState) {
  return {
    //open: state.popup.FILE_UPLOAD,
    files: state.fileUpload.uploading
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onClose: () => {
      console.log('onClose')
      //dispatch(togglePopup(PopupTypes.fileUpload, false))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadProgressPopup)) // TODO typing
