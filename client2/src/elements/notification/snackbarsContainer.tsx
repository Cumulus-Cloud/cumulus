import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Snackbars from './Snackbars'
import GlobalState from '../../actions/state'
import { hideSnakebar } from '../../actions/snackbar/snackbarActions';

function mapStateToProps(state: GlobalState) {
  return {
    messages: state.snackbar.messages
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    onClose: (id: string) => {
      dispatch(hideSnakebar(id))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Snackbars)) // TODO typing
