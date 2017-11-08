import * as React from "react"
// import * as styles from "directory/DirectoryContianer.css"
import { connect, Dispatch } from "react-redux"
// import * as DirectoryActions from "directory/DirectoryActions"
import { GlobalState } from "store"
import { DirectoryState } from "directory/DirectoryReducer"

interface DispatchProps {
}

type Props = DirectoryState & DispatchProps

class DirectoryContainer extends React.PureComponent<Props> {
  render() {
    return (
      <div>DirectoryContainer</div>
    )
  }
}

const mapStateToProps = (state: GlobalState): DirectoryState => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryContainer)


/*
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