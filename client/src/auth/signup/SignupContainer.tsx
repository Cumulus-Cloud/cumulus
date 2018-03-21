import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as SignupActions from "auth/signup/SignupActions"
import { GlobalState } from "store"
import SignupForm from "auth/signup/SignupForm"
import { SignupState } from "auth/signup/SignupReducer"
import AuthLayout from "auth/AuthLayout"
import GhostButton from "components/buttons/GhostButton"

interface DispatchProps {
  onChange(field: string, value: string): void
  onSubmit(login: string, email: string, password: string): void
}

type Props = SignupState & DispatchProps

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

const mapStateToProps = (state: GlobalState): SignupState => state.signup

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(SignupActions.signupChange(field, value)),
    onSubmit: (login, email, password) => dispatch(SignupActions.signupSubmit(login, email, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupContainer)
