import * as React from "react"
import { hashHistory } from "react-router"


interface Props {
  style?: any 
}

export default class Login extends React.Component<Props, void> {
  render() {
    return (
      <div style={styles.container}>
        <h1>Login</h1>
        <button onClick={() => hashHistory.push("/signup")}>Signup</button>
      </div>
    )
  }
}

interface Style {
  container: React.CSSProperties
}

const styles: Style = {
  container: {
  }
}
