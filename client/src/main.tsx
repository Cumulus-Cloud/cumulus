import "es6-promise/auto"
import "es6-shim"
import "reset-css/reset.css"
import "./main.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Route } from "react-router"
import { Provider } from "react-redux"
import { ConnectedRouter } from "react-router-redux"
import LoginContainer from "auth/login/LoginContainer"
import SignupContainer from "auth/signup/SignupContainer"
import DirectoriesContainer from "directories/DirectoriesContainer"
import { store, history } from "store"

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" component={DirectoriesContainer} />
        <Route exact path="/fs/*" component={DirectoriesContainer} />
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/signup" component={SignupContainer} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("app")
)
