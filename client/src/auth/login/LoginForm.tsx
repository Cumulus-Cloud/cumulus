import * as React from "react"
import * as styles from "./LoginForm.css"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"
import KeyDownAction from "components/KeyDownAction"
import { ApiError } from "models/ApiError"

interface Props {
  login: string
  password: string
  loading: boolean
  formErrors?: ApiError
  onChange(field: string, value: string): void
  onSubmit(login: string, password: string): void
}

export default class LoginForm extends React.PureComponent<Props> {
  render() {
    const { login, password, formErrors, loading } = this.props
    return (
      <KeyDownAction onKeyDown={this.onKeyPressHandler}>
        <div className={styles.loginForm}>
          <Input
            type="text"
            label={Messages("ui.auth.login")}
            value={login}
            error={formErrors && formErrors.errors && formErrors.errors.login && formErrors.errors.login.map(e => e.message).join(", ")}
            onChange={this.handleChange("login")}
          />
          <Input
            type="password"
            label={Messages("ui.auth.password")}
            value={password}
            error={formErrors && formErrors.errors && formErrors.errors.password && formErrors.errors.password.map(e => e.message).join(", ")}
            onChange={this.handleChange("password")}
          />
          <div className={styles.action}>
            <Button label={Messages("ui.auth.loginAction")} loading={loading} onClick={this.handleSubmit} large matchParent />
            <div className={styles.formError}>
              {formErrors && formErrors.message ? formErrors.message : null}
            </div>
          </div>
        </div>
      </KeyDownAction>
    )
  }

  onKeyPressHandler = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      this.handleSubmit()
    }
  }

  handleChange = (field: string) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { login, password, onSubmit } = this.props
    onSubmit(login, password)
  }
}
