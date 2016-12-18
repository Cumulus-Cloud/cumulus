import * as React from "react"
import { hashHistory } from "react-router"
import { Account, AccountSignup, validateSignup } from "../models/Account"
import { ValidationErrors, getError } from "../models/validation"

import * as Api from "../services/Api"
import Input from "../components/Input"
import Button from "../components/Button"

interface State {
  loading: boolean
  account: AccountSignup
  errors: ValidationErrors<AccountSignup>
}

type PartialState = Partial<State>

export default class SignUp extends React.Component<void, State> {

  state = {
    loading: false,
    account: {
      login: "",
      mail: "",
      password: "",
    },
    errors: {}
  }

  render() {
    return (
      <div className="login">
        <div className="form-login">
          <Input
            label="Login"
            value={this.state.account.login}
            error={getError<AccountSignup>("login", this.state.errors)}
            onChange={this.handleChange("login")}
          />
          <Input type="email"
            label="Email"
            value={this.state.account.mail}
            error={getError<AccountSignup>("mail", this.state.errors)}
            onChange={this.handleChange("mail")}
          />
          <Input type="password"
            label="Password"
            value={this.state.account.password}
            error={getError<AccountSignup>("password", this.state.errors)}
            onChange={this.handleChange("password")}
          />
          <div className="form-action">
            <Button loading={this.state.loading} onClick={this.handleSubmit}>Sign Up</Button>
          </div>
        </div>
      </div>
    )
  }

  handleSubmit = () => {
    const { account } = this.state

    const errors = validateSignup(account)

    console.debug("handleSubmit", errors, this.state)
    if (!errors) {
      this.setState({
        errors: {},
        loading: true
      } as PartialState as State)
      Api.signup(account).then(result => {
        console.debug("signup", result)
        Api.saveAuthToken(result.token, true)
        this.setState({
          loading: false
        } as PartialState as State)
        hashHistory.replace("/")
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

  handleChange = (field: keyof AccountSignup) => (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      account: {...this.state.account, [field]: e.target.value }
    } as PartialState as State)
  }
}
