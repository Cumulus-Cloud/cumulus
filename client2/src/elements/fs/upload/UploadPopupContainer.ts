import { selectUploadFile, deleteUploadFile, updateUploadFile } from './../../../actions/fs/fileUpload/fileUploadActions'
import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import UploadPopup from './UploadPopup'
import GlobalState from '../../../actions/state'
import { createDirectory } from '../../../actions/fs/directoryCreation/createDirectoryActions'
import { togglePopup, PopupTypes } from '../../../actions/popup/popupActions'
import { EnrichedFile } from '../../../models/EnrichedFile'

function mapStateToProps(state: GlobalState) {
  return {
    open: state.popup.FILE_UPLOAD,
    current: state.fs.current,
    files: state.fileUpload.files,
    loading: state.createDirectory.loading,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onFilesSelected: (files: EnrichedFile[]) => {
      dispatch(selectUploadFile(files))
    },
    onDeleteFile: (deletedFile: EnrichedFile) => {
      dispatch(deleteUploadFile(deletedFile))
    },
    onUpdateFile: (updatedFile: EnrichedFile) => {
      dispatch(updateUploadFile(updatedFile))
    },
    onClose: () => {
      dispatch(togglePopup(PopupTypes.fileUpload, false))
    },
    onCreateDirectory: (path: string) => {
      dispatch(createDirectory(path))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadPopup)) // TODO typing
