import "es6-promise/auto"
import "es6-shim"
import "reset-css/reset.css"
import "./main.css"
import "rxjs/add/operator/map"
import "rxjs/add/operator/switchMap"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/filter"
import "rxjs/add/operator/delay"
import "rxjs/add/observable/of"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { Route } from "react-router"
import { Provider } from "react-redux"
import { ConnectedRouter } from "react-router-redux"
import LoginContainer from "auth/login/LoginContainer"
import SignupContainer from "auth/signup/SignupContainer"
import FileSystemContainer from "files/fileSystem/FileSystemContainer"
import { store, history } from "store"

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" component={FileSystemContainer} />
        <Route exact path="/fs/*" component={FileSystemContainer} />
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/signup" component={SignupContainer} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("app")
)
