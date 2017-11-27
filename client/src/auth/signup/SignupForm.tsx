import * as React from "react"
import * as styles from "auth/signup/SignupForm.css"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"
import { ApiError } from "services/Api"

interface Props {
  login: string
  email: string
  password: string
  loading: boolean
  formErrors?: ApiError
  onChange: (field: string, value: string) => void
  onSubmit: (login: string, email: string, password: string) => void
}

export default class SignupForm extends React.PureComponent<Props> {
  componentWillMount() {
    document.addEventListener("keydown", this.onKeyPressHandler, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressHandler, false)
  }

  onKeyPressHandler = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      this.handleSubmit()
    }
  }

  render() {
    const { login, email, password, formErrors, loading } = this.props
    return (
      <div className={styles.signupForm}>
        <Input
          type="text"
          label={Messages("ui.auth.login")}
          value={login}
          error={formErrors && formErrors.errors && formErrors.errors.login && formErrors.errors.login.map(e => e.message).join(", ")}
          onChange={this.handleChange("login")}
        />
        <Input
          type="email"
          label={Messages("ui.auth.email")}
          value={email}
          error={formErrors && formErrors.errors && formErrors.errors.email && formErrors.errors.email.map(e => e.message).join(", ")}
          onChange={this.handleChange("email")}
        />
        <Input
          type="password"
          label={Messages("ui.auth.password")}
          value={password}
          error={formErrors && formErrors.errors && formErrors.errors.password && formErrors.errors.password.map(e => e.message).join(", ")}
          onChange={this.handleChange("password")}
        />
        <div className={styles.action}>
          <Button label={Messages("ui.auth.signup")} loading={loading} onClick={this.handleSubmit} />
          <div className={styles.formError}>
            {formErrors && formErrors.message ? formErrors.message : null}
          </div>
        </div>
      </div>
    )
  }

  handleChange = (field: string) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { login, email, password, onSubmit } = this.props
    onSubmit(login, email, password)
  }
}
