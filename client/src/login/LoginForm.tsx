import * as React from "react"
import * as styles from "login/LoginForm.css"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"
import { FormErrors } from "services/Api"

interface Props {
  mail: string
  password: string
  loading: boolean
  formErrors: FormErrors
  onChange: (field: string, value: string) => void
  onSubmit: (mail: string, password: string) => void
}

export default class LoginForm extends React.PureComponent<Props> {
  render() {
    const { mail, password, formErrors, loading } = this.props
    return (
      <div className={styles.loginForm}>
        <Input
          type="email"
          label="Email"
          value={mail}
          error={formErrors.mail}
          onChange={this.handleChange("mail")}
        />
        <Input
          type="password"
          label="Password"
          value={password}
          error={formErrors.password}
          onChange={this.handleChange("password")}
        />
        <div className={styles.action}>
          <Button label="Login" loading={loading} onClick={this.handleSubmit} />
          <div className={styles.formError}>
            {formErrors.login ? formErrors.login : null}
          </div>
        </div>
      </div>
    )
  }

  handleChange = (field: string) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { mail, password, onSubmit } = this.props
    onSubmit(mail, password)
  }
}
