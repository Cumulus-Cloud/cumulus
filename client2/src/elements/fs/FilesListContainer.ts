import { EnrichedFile } from './../../models/EnrichedFile'
import { selectUploadFile } from './../../actions/fs/fileUpload/fileUploadActions'
import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import GlobalState from '../../actions/state'
import { getDirectory } from '../../actions/fs/fsActions'
import { PopupTypes, togglePopup } from './../../actions/popup/popupActions'
import FilesList from './FilesList'
import { push } from 'connected-react-router'
import Routes from '../../services/routes';

function mapStateToProps(state: GlobalState) {
  return {
    currentDirectory: state.fs.current,
    loading: state.fs.loadingCurrent,
    error: state.fs.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onChangePath: (path: string, contentOffset: number) => {
      dispatch(push(`${Routes.app.fs}${path}`))
      dispatch(getDirectory(path, contentOffset))
    },
    onFileUpload: (files: EnrichedFile[]) => {
      dispatch(selectUploadFile(files))
      dispatch(togglePopup(PopupTypes.fileUpload, true))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FilesList)) // TODO typing
