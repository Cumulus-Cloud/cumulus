import * as React from "react"
import * as styles from "auth/LoginContainer.css"
import { connect, Dispatch } from "react-redux"
import * as AuthActions from "./AuthActions"
import { GlobalState } from "store"
import LoginForm from "./LoginForm"
import { Login } from "./AuthReducer"
import LinkButton from "../components/buttons/LinkButton"

interface DispatchProps {
  onChange: (field: string, value: string) => void
  onSubmit: (login: Login) => void
}

interface StateProps {
  login: Login
  loading: boolean
}

type Props = StateProps & DispatchProps

class LoginContainer extends React.PureComponent<Props> {
  render() {
    const { login, loading, onChange, onSubmit } = this.props
    return (
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Cumulus</h2>
        <LoginForm
          login={login}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <LinkButton href="#/signup">Signup</LinkButton>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState): StateProps => {
  return {
    login: state.auth.login,
    loading: state.auth.loading,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onChange: (field: string, value: string) => dispatch(AuthActions.loginOnChange(field, value)),
    onSubmit: (login: Login) => dispatch(AuthActions.loginOnSubmit(login))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
