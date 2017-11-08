import "es6-promise/auto"
import "es6-shim"
import "reset-css/reset.css"
import "./main.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Route } from "react-router"
import { Provider } from "react-redux"
import { ConnectedRouter } from "react-router-redux"
import LoginContainer from "./login/LoginContainer"
import { store, history } from "./store"

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" component={LoginContainer} />
        <Route exact path="/login" component={LoginContainer} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("app")
)
