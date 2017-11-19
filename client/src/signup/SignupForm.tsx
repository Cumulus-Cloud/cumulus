import * as React from "react"
import * as styles from "signup/SignupForm.css"
import Input from "components/inputs/Input"
import Button from "components/buttons/Button"
import { FormErrors } from "services/Api"

interface Props {
  login: string
  mail: string
  password: string
  loading: boolean
  formErrors: FormErrors
  onChange: (field: string, value: string) => void
  onSubmit: (login: string, mail: string, password: string) => void
}

export default class SignupForm extends React.PureComponent<Props> {
  render() {
    const { login, mail, password, formErrors, loading } = this.props
    return (
      <div className={styles.signupForm}>
        <Input
          type="text"
          label="Login"
          value={login}
          error={formErrors.login}
          onChange={this.handleChange("login")}
        />
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
          <Button label="Signup" loading={loading} onClick={this.handleSubmit} />
          <div className={styles.formError}>
            {formErrors.signup ? formErrors.signup : null}
          </div>
        </div>
      </div>
    )
  }

  handleChange = (field: string) => (value: string) => this.props.onChange(field, value)

  handleSubmit = () => {
    const { login, mail, password, onSubmit } = this.props
    onSubmit(login, mail, password)
  }
}
