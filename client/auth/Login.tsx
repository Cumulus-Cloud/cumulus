import * as React from "react"
import { hashHistory } from "react-router"

import * as Api from "../services/Api"

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
        <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input}
            type="email"
            value={this.state.mail}
            onChange={this.handleChange("mail")}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input}
            type="password"
            value={this.state.password}
            onChange={this.handleChange("password")}
          />
        </div>
        <div style={styles.formGroup}>
          <div className="btn" onClick={this.handleSubmit}>Login</div>
        </div>
        {/*<button onClick={() => hashHistory.push("/signup")}>Signup</button>*/}
        </div>
      </div>
    )
  }

  handleChange = (field: keyof State) => (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ [field]: e.target.value } as PartialState as State)
  }

  handleSubmit = () => {
    console.debug("handleSubmit", this.state)
    // TODO add client validation
    Api.login(this.state.mail, this.state.password).then(result => {
      console.debug("login", result)
      Api.saveAuthToken(result.token, true)
    }).catch(error => {
      console.debug("fetch error", error)
    })
  }
}

interface Style {
  container: React.CSSProperties
  form: React.CSSProperties
  formGroup: React.CSSProperties
  label: React.CSSProperties
  input: React.CSSProperties
}

const styles: Style = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "300px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15,
  },
  label: {
    flex: 1,
    color: "#B2B2B2",
    paddingBottom: 4,
    paddingLeft: 10,
  },
  input: {
    outline: "none",
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, .1)",
    fontSize: "1rem",
    border: "none",
    borderRadius: 15,
    padding: 10,
    color: "#FFFFFF",
  }
}
