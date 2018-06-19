import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { push } from 'connected-react-router'

import SignUpForm from './SignUpForm'
import { signUp } from '../../actions/user/signUp/signUpActions'
import GlobalState from '../../actions/state'
import Routes from '../../services/routes'

function mapStateToProps(state: GlobalState) {
  return {
    loading: state.signUp.loading,
    error: state.signUp.error
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    onSignUp: (login: string, email: string, password: string) => {
      dispatch(signUp(login, email, password))
    },
    onSignIn: () => {
      dispatch(push(Routes.auth.signIn))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignUpForm) as any) // TODO typing
