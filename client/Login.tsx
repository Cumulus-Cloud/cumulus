import * as React from "react"
import { hashHistory } from "react-router"

interface Props {
  style?: any 
}

interface State {
  mail: string
  password: string
}

type PartialState = Partial<State>

export default class Login extends React.Component<Props, State> {

  state = {
    mail: "",
    password: "",
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>Login</h1>
        <div>
          <label>Email</label>
          <input type="email" value={this.state.mail} onChange={this.handleChange("mail")} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={this.state.password} onChange={this.handleChange("password")} />
        </div>
        <div>
          <button onClick={this.handleSubmit}>Login</button>
        </div>
        <button onClick={() => hashHistory.push("/signup")}>Signup</button>
      </div>
    )
  }

  handleChange = (field: keyof State) => (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ [field]: e.target.value } as PartialState as State)
  }

  handleSubmit = () => {
    console.debug("handleSubmit", this.state)
    // TODO add to separate file
    // TODO add client validation
    fetch(`http://localhost:9000/accounts/login`, {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json"
      },
    }).then(response => response.json()).then(result => {
      console.debug("fetch", result)
    }).catch(error => {
      console.debug("fetch error", error)
    })
  }
}

interface Style {
  container: React.CSSProperties
}

const styles: Style = {
  container: {
  }
}
