import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import GlobalState from '../../actions/state'
import { getDirectory } from '../../actions/fs/fsActions'
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
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FilesList)) // TODO typing
