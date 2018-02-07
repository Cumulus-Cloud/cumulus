import * as React from "react"
import { connect, Dispatch } from "react-redux"
import * as SignupActions from "auth/signup/SignupActions"
import { GlobalState } from "store"
import SignupForm from "auth/signup/SignupForm"
import { SignupState } from "auth/signup/SignupReducer"
import LinkButton from "components/buttons/LinkButton"
import AuthLayout from "auth/AuthLayout"

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
        <LinkButton href="#/login">{Messages("ui.auth.login")}</LinkButton>
      </AuthLayout>
    )
  }
}

const mapStateToProps = (state: GlobalState): SignupState => state.signup

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(SignupActions.signupOnChange(field, value)),
    onSubmit: (login, email, password) => dispatch(SignupActions.signupOnSubmit(login, email, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupContainer)
