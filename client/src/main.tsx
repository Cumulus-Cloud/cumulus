import "es6-promise/auto"
import "es6-shim"
import "reset-css/reset.css"
import "./main.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Route, Switch } from "react-router"
import { Provider } from "react-redux"
import { ConnectedRouter } from "react-router-redux"
import LoginContainer from "auth/login/LoginContainer"
import SignupContainer from "auth/signup/SignupContainer"
import FileSystemContainer from "files/fileSystem/FileSystemContainer"
import { store, history, persistor } from "store"
import { PersistGate } from "redux-persist/integration/react"

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={FileSystemContainer} />
        <Route exact path="/fs/*" component={FileSystemContainer} />
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/signup" component={SignupContainer} />
      </Switch>
    </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById("app")
)
