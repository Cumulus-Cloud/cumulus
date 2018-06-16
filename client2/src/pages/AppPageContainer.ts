import { connect, Dispatch } from 'react-redux'

import AppPage from './AppPage'
import FsState from '../actions/fs/fsState'
import { FsActions, getDirectory } from '../actions/fs/fsActions'
import GlobalState from '../actions/state';

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

export default connect(mapStateToProps, mapDispatchToProps)(AppPage)
