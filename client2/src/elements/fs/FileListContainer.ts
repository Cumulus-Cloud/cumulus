import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { push } from 'connected-react-router'
import Routes from '../../services/routes'

import { EnrichedFile } from './../../models/EnrichedFile'
import { selectUploadFile } from './../../actions/fs/fileUpload/fileUploadActions'
import GlobalState from '../../actions/state'
import { getDirectory } from '../../actions/fs/fsActions'
import { PopupTypes, togglePopup } from './../../actions/popup/popupActions'
import FileList from './FileList'

function mapStateToProps(state: GlobalState) {
  return {
    currentDirectory: state.fs.current,
    currentDirectoryContent: state.fs.content,
    loading: state.fs.loadingCurrent,
    contentLoading: state.fs.loadingContent,
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

export default connect(mapStateToProps, mapDispatchToProps)(FileList)
