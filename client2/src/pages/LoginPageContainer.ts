import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Login from '../pages/LoginPage'
import { UserActions, signIn, signUp } from '../actions/user/userActions'
import GlobalState from '../actions/state'

function mapStateToProps(state: GlobalState) {
  return {
    signIn: { ...state.user.signIn },
    signUp: { ...state.user.signUp },
    showLoader: state.user.loading
  }
}

function mapDispatchToProps(dispatch: Dispatch<UserActions>) {
  return {
    onSignIn: (login: string, password: string) => {
      dispatch(signIn(login, password))
    },
    onSignUp: (login: string, email: string, password: string) => {
      dispatch(signUp(login, email, password))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login) as any) // TODO typing
