import * as React from "react"
import * as ReactDOM from "react-dom"
import { Router, Route, hashHistory } from "react-router"

import Login from "./auth/Login"
import SignUp from "./auth/SignUp"
import DirectoryContainer from "./directory/DirectoryContainer"

import * as Api from "./services/Api"

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/signup" component={SignUp}/>
    <Route path="/" component={DirectoryContainer} onEnter={(a) => {
      Api.directory("").then(directory => {
        console.debug("onEnter", a, directory)
      }).catch(error => {
        console.debug("onEnter error", a, error)
      })
    }} />
    <Route path="/*" component={DirectoryContainer} onEnter={(a) => {
      Api.directory(a.params["splat"]).then(directory => {
        console.debug("onEnter", a, directory)
      }).catch(error => {
        console.debug("onEnter error", a, error)
      })
    }} />
  </Router>,
  document.getElementById("app")
)
