import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { push } from 'connected-react-router'

import SignInForm from './SignInForm'
import { SignInActions, signIn } from '../../actions/user/signIn/signInActions'
import GlobalState from '../../actions/state'
import Routes from '../../services/routes';

function mapStateToProps(state: GlobalState) {
  return {
    loading: state.signIn.loading,
    error: state.signIn.error
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    onSignIn: (login: string, password: string) => {
      dispatch(signIn(login, password))
    },
    onSignUp: () => {
      dispatch(push(Routes.auth.signUp))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignInForm) as any) // TODO typing
