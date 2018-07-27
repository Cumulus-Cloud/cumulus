import { selectUploadFile, deleteUploadFile, updateUploadFile, uploadAllFiles } from './../../../actions/fs/fileUpload/fileUploadActions'
import { connect, Dispatch } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import UploadPopup from './UploadPopup'
import GlobalState from '../../../actions/state'
import { togglePopup, isSelected } from '../../../actions/popup/popupActions'
import { EnrichedFile } from '../../../models/EnrichedFile'
import { push } from 'connected-react-router';

function mapStateToProps(state: GlobalState) {
  const selection = isSelected('FILE_UPLOAD')(state.router.location)

  return {
    open: selection.selected,
    current: state.fs.current,
    files: state.fileUpload.files,
    loading: state.createDirectory.loading,
    error: state.createDirectory.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
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
      dispatch(togglePopup('FILE_UPLOAD', false)(props.location))
    },
    onUploadFiles: () => {
      dispatch(uploadAllFiles())
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadPopup)) // TODO typing
