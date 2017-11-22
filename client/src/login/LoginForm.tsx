import * as React from "react"
import * as styles from "login/LoginForm.css"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"
import { ApiError } from "services/Api"

interface Props {
  login: string
  password: string
  loading: boolean
  formErrors?: ApiError
  onChange: (field: string, value: string) => void
  onSubmit: (login: string, password: string) => void
}

export default class LoginForm extends React.PureComponent<Props> {
  render() {
    const { login, password, formErrors, loading } = this.props
    return (
      <div className={styles.loginForm}>
        <Input
          type="text"
          label="Login"
          value={login}
          error={formErrors && formErrors.errors && formErrors.errors.login && formErrors.errors.login.map(e => e.message).join(", ")}
          onChange={this.handleChange("login")}
        />
        <Input
          type="password"
          label="Password"
          value={password}
          error={formErrors && formErrors.errors && formErrors.errors.password && formErrors.errors.password.map(e => e.message).join(", ")}
          onChange={this.handleChange("password")}
        />
        <div className={styles.action}>
          <Button label="Login" loading={loading} onClick={this.handleSubmit} />
          <div className={styles.formError}>
            {formErrors && formErrors.message ? formErrors.message : null}
          </div>
        </div>
      </div>
    )
  }

  handleChange = (field: string) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { login, password, onSubmit } = this.props
    onSubmit(login, password)
  }
}
