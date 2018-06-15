import { connect, Dispatch } from 'react-redux'

import Login from '../pages/LoginPage'
import UserState from '../actions/user/userState'
import { UserActions, signIn, signUp } from '../actions/user/userActions'
import { ApiError } from '../models/ApiError'
import { User } from '../models/User'

export interface Props {
  signIn: {
    error?: ApiError
    user: User
  }
  signUp: {
    error?: ApiError
    user: User
  }
  onSignIn: (login: string, password: string) => void
  onSignUp: (login: string, email: string, password: string) => void
}

function mapStateToProps(state: UserState) {
  return {
    signIn: { ...state.signIn },
    signUp: { ...state.signUp },
    showLoader: state.loading
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

export default connect(mapStateToProps, mapDispatchToProps)(Login)
