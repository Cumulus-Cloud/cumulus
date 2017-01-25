import * as React from "react"
import * as ReactDOM from "react-dom"
import { Router, Route, hashHistory } from "react-router"

import Login from "./auth/Login"
import SignUp from "./auth/SignUp"
import DirectoryContainer from "./directory/DirectoryContainer"
import NotFound from "./components/NotFound" 

import { fetchDirectory } from "./directory/directoryActions"

import * as Api from "./services/Api"

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/login" component={Login}/>
    <Route path="/signup" component={SignUp}/>
    <Route path="notfound" component={NotFound} />
    <Route path="/" component={DirectoryContainer} onEnter={_ => {
      fetchDirectory("")
    }} />
    <Route path="/*" component={DirectoryContainer} onEnter={route => {
      fetchDirectory(route.params["splat"])
    }} />
  </Router>,
  document.getElementById("app")
)
