import * as React from "react"
import * as ReactDOM from "react-dom"
import { Router, Route, hashHistory } from "react-router"

import Login from "./auth/Login"
import SignUp from "./auth/SignUp"
import DirectoryContainer from "./directory/DirectoryContainer"
import NotFound from "./components/NotFound" 

import { fetchDirectory } from "./directory/directoryActions"

import * as Api from "./services/Api"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import { deepOrange500 } from "material-ui/styles/colors"
import * as injectTapEventPlugin from "react-tap-event-plugin"

injectTapEventPlugin()

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
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
    </Router>
  </MuiThemeProvider>,
  document.getElementById("app")
)
