import { connect, Dispatch } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { push } from 'connected-react-router'
import Routes from '../../services/routes'

import { EnrichedFile } from './../../models/EnrichedFile'
import { selectUploadFile, uploadFileShowProgress } from './../../actions/fs/fileUpload/fileUploadActions'
import GlobalState from '../../actions/state'
import { getDirectory } from '../../actions/fs/fsActions'
import FileList from './FileList'

function mapStateToProps(state: GlobalState) {

  return {
    initialPath: (state as any).router.location.pathname.substring(7), // TODO cleaner
    currentDirectory: state.fs.current,
    currentDirectoryContent: state.fs.content,
    loading: state.fs.loadingCurrent,
    contentLoading: state.fs.loadingContent,
    error: state.fs.error
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
  return {
    onChangePath: (path: string, contentOffset: number) => {
      dispatch(push(`${Routes.app.fs}${path}${props.location.search}`))
      dispatch(getDirectory(path, contentOffset))
    },
    onLoadDirectory: (path: string, contentOffset: number) => {
      dispatch(getDirectory(path, contentOffset))
    },
    onFileUpload: (files: EnrichedFile[]) => {
      dispatch(selectUploadFile(files))
      dispatch(uploadFileShowProgress())
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FileList))
