import * as React from "react"
import * as styles from "login/LoginContainer.css"
import { connect, Dispatch } from "react-redux"
import * as LoginActions from "./LoginActions"
import { GlobalState } from "store"
import LoginForm from "./LoginForm"
import { LoginState } from "./LoginReducer"
import LinkButton from "../components/buttons/LinkButton"

interface DispatchProps {
  onChange: (field: string, value: string) => void
  onSubmit: (mail: string, password: string) => void
}

type Props = LoginState & DispatchProps

class LoginContainer extends React.PureComponent<Props> {
  render() {
    const { mail, password, formErrors, loading, onChange, onSubmit } = this.props
    return (
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Cumulus</h2>
        <LoginForm
          mail={mail}
          password={password}
          formErrors={formErrors}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <LinkButton href="#/signup">Signup</LinkButton>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState): LoginState => {
  return state.login
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field, value) => dispatch(LoginActions.loginOnChange(field, value)),
    onSubmit: (mail, password) => dispatch(LoginActions.loginOnSubmit(mail, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
