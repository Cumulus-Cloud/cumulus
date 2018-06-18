import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import AppPage from './AppPage'
import { FsActions, getDirectory } from '../actions/fs/fsActions'
import GlobalState from '../actions/state'

function mapStateToProps(state: GlobalState) {
  return {
    currentDirectory: state.fs.current,
    showLoader: state.fs.loadingCurrent
  }
}

function mapDispatchToProps(dispatch: Dispatch<FsActions>) {
  return {
    onChangePath: (path: string, contentOffset: number) => {
      dispatch(getDirectory(path, contentOffset))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppPage) as any) // TODO typing
