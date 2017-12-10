import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as LoginActions from "./LoginActions"
import { GlobalState } from "store"
import LoginForm from "./LoginForm"
import { LoginState } from "./LoginReducer"
import AuthLayout from "auth/AuthLayout"
import LinkButton from "components/buttons/LinkButton"

interface DispatchProps {
  onChange: (field: string, value: string) => void
  onSubmit: (login: string, password: string) => void
}

type Props = LoginState & DispatchProps

class LoginContainer extends React.PureComponent<Props> {
  render() {
    const { login, password, formErrors, loading, onChange, onSubmit } = this.props
    return (
      <AuthLayout>
        <LoginForm
          login={login}
          password={password}
          formErrors={formErrors}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <LinkButton href="#/signup">{Messages("ui.auth.signup")}</LinkButton>
      </AuthLayout>
    )
  }
}

const mapStateToProps = (state: GlobalState): LoginState => {
  return state.login
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(LoginActions.loginOnChange(field, value)),
    onSubmit: (login, password) => dispatch(LoginActions.loginOnSubmit(login, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
