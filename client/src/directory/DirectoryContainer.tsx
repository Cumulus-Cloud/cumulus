/*
import * as React from "react"
import { Provider } from "react-redux"
import { createStore, combineReducers } from "redux"
import { hashHistory, RouteComponentProps } from "react-router"

import { directoryReducer, DirectoryState } from "./directoryReducer"
import Directory from "./Directory"

export const store = createStore(
  directoryReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)

const DirectoryContainer = (props: RouteComponentProps<any, any>) => {
  return (
    <Provider store={store}>
      <Directory />
    </Provider>
  )
}

export default DirectoryContainer
*/