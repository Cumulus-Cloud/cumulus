import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Login from './pages/login'
import { connect, Dispatch, Provider } from 'react-redux'

import { store } from './actions/store'
import UserState from './actions/userState';
import { UserActions, signIn, signUp } from './actions/userActions';
import { ApiError } from './models/ApiError';
import { User } from './models/User';

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
    signUp: { ...state.signUp }
  }
}

function mapDispatchToProps(dispatch: Dispatch<UserActions>) {
  return {
    onSignIn: (login: string, password: string) =>
      dispatch(signIn(login, password)),
    onSignUp: (login: string, email: string, password: string) =>
      dispatch(signUp(login, email, password))
  }
}

const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login)


ReactDOM.render(
  <Provider store={store} >
    <LoginContainer />
  </Provider>,
  document.querySelector('#app')
)
