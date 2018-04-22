import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { AuthActions } from "auth/AuthActions"
import { GlobalState } from "store"
import SignupForm from "auth/signup/SignupForm"
import AuthLayout from "auth/AuthLayout"
import GhostButton from "components/buttons/GhostButton"
import { ApiError } from "models/ApiError"

interface DispatchProps {
  onChange(field: string, value: string): void
  onSubmit(login: string, email: string, password: string): void
}

interface PropsState {
  login: string
  email: string
  password: string
  loading: boolean
  formErrors?: ApiError
}

type Props = PropsState & DispatchProps

class SignupContainer extends React.PureComponent<Props> {
  render() {
    const { login, email, password, formErrors, loading, onChange, onSubmit } = this.props
    return (
      <AuthLayout>
        <SignupForm
          login={login}
          email={email}
          password={password}
          formErrors={formErrors}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <GhostButton label={Messages("ui.auth.login")} href="#/login" matchParent />
      </AuthLayout>
    )
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return state.auth.signup
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(AuthActions.signupChange({ field, value })),
    onSubmit: (login, email, password) => dispatch(AuthActions.signupSubmit({ login, email, password }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupContainer)
