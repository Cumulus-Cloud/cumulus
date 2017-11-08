import * as React from "react"
import * as styles from "auth/LoginForm.css"
import { Login } from "auth/AuthReducer"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"

interface Props {
  login: Login
  loading: boolean
  errors?: any
  onChange: (field: string, value: string) => void
  onSubmit: (login: Login) => void
}

export default class LoginForm extends React.PureComponent<Props> {
  render() {
    const { login, loading } = this.props
    return (
      <div className={styles.loginForm}>
        <Input
          type="email"
          label="Email"
          value={login.email}
          onChange={this.handleChange("email")}
        />
        <Input
          type="password"
          label="Password"
          value={login.password}
          onChange={this.handleChange("password")}
        />
        <div className={styles.action}>
          <Button label="Login" loading={loading} onClick={this.handleSubmit} />
        </div>
      </div>
    )
  }

  handleChange = (field: keyof Login) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { login, onSubmit } = this.props
    onSubmit(login)
  }
}
