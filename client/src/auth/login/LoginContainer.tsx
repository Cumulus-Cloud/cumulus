import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { AuthActions } from "auth/AuthActions"
import { GlobalState } from "store"
import LoginForm from "./LoginForm"
import AuthLayout from "auth/AuthLayout"
import GhostButton from "components/buttons/GhostButton"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

interface DispatchProps {
  onChange(field: string, value: string): void
  onSubmit(login: string, password: string): void
}

interface PropsState {
  login: string
  password: string
  formErrors?: ApiError
  loading: boolean
}

type Props = PropsState & DispatchProps

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
        <GhostButton label={Messages("ui.auth.signup")} href="#/signup" matchParent />
      </AuthLayout>
    )
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return state.auth.login
}

const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(AuthActions.loginChange(field, value)),
    onSubmit: (login, password) => dispatch(AuthActions.loginSubmit(login, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
