import * as React from "react"
import { hashHistory } from "react-router"
import { Account, AccountLogin, validateLogin } from "../models/Account"
import { ValidationErrors, getError } from "../models/validation"

import * as Api from "../services/Api"
import Input from "../components/Input"
import Button from "../components/Button"

interface State {
  loading: boolean
  accountLogin: AccountLogin
  errors: ValidationErrors<AccountLogin>
}

type PartialState = Partial<State>

export default class Login extends React.Component<void, State> {

  state = {
    loading: false,
    accountLogin: {
      mail: "",
      password: "",
    },
    errors: {}
  }

  render() {

    console.debug("Login render", this.state)

    return (
      <div className="login">
        <div className="form-login">
          <Input type="email"
            label="Email"
            value={this.state.accountLogin.mail}
            error={getError<AccountLogin>("mail", this.state.errors)}
            onChange={this.handleChange("mail")}
          />
          <Input type="password"
            label="Password"
            value={this.state.accountLogin.password}
            error={getError<AccountLogin>("password", this.state.errors)}
            onChange={this.handleChange("password")}
          />
          <div className="form-action">
            <Button loading={this.state.loading} onClick={this.handleSubmit}>Login</Button>
          </div>
        </div>
      </div>
    )
  }

  handleChange = (field: keyof AccountLogin) => (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      accountLogin: {...this.state.accountLogin, [field]: e.target.value }
    } as PartialState as State)
  }

  handleSubmit = () => {
    const { accountLogin } = this.state

    const errors = validateLogin(accountLogin)

    console.debug("handleSubmit", errors, this.state)
    if (!errors) {
      this.setState({
        errors: {},
        loading: true
      } as PartialState as State)
      Api.login(this.state.accountLogin).then(result => {
        console.debug("login", result)
        Api.saveAuthToken(result.token, true)
        this.setState({
          loading: false
        } as PartialState as State)
      }).catch(error => {
        console.debug("fetch error", error)
        this.setState({
          loading: false
        } as PartialState as State)
      })
    } else {
      this.setState({
        errors
      } as PartialState as State)
    }
  }
}
