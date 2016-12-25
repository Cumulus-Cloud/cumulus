import * as React from "react"
import * as ReactDOM from "react-dom"
import { createStore, combineReducers } from "redux"
import { Provider } from "react-redux"
import { Router, Route, hashHistory } from "react-router"
import { syncHistoryWithStore, routerReducer } from "react-router-redux"

import App from "./App"
import Login from "./auth/Login"
import SignUp from "./auth/SignUp"

import { appReducer } from "./AppReducer"

const store = createStore(
  combineReducers({
    routing: routerReducer
  }),
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)

const history = syncHistoryWithStore(hashHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App} />
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={SignUp}/>
    </Router>
  </Provider>,
  document.getElementById("app")
)
