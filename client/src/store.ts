import { Reducer } from "redux"
import { RouterState } from "react-router-redux"
import { composeWithDevTools } from "redux-devtools-extension"
import createHashHistory from "history/createHashHistory"
import { createStore, combineReducers, applyMiddleware } from "redux"
import { routerReducer, routerMiddleware } from "react-router-redux"
import thunkMiddleware from "redux-thunk"
import { AuthState, AuthReducer } from "auth/AuthReducer"

export interface GlobalState {
  auth: AuthState
  router: Reducer<RouterState>
}

export const history = createHashHistory()
const middleware = routerMiddleware(history)
const reducers = combineReducers({
  auth: AuthReducer,
  router: routerReducer,
})
const enhancer = composeWithDevTools(
  applyMiddleware(thunkMiddleware),
  applyMiddleware(middleware),
)
export const store = createStore(reducers, enhancer)
