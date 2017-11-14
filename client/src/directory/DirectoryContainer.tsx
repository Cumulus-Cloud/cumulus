import * as React from "react"
import { connect, Dispatch } from "react-redux"
//import * as DirectoryActions from "directory/DirectoryActions"
import { GlobalState } from "store"
import { DirectoryState } from "directory/DirectoryReducer"
import AppBar from "components/AppBar"
import Breadcrumb from "components/directory/Breadcrumb"
import { history } from "store"
import NewFolderContainer from "newFolder/NewFolderContainer"

interface DispatchProps {
}

type Props = DirectoryState & DispatchProps

class DirectoryContainer extends React.PureComponent<Props> {
  render() {
    return (
      <div>
        <AppBar />
        <Breadcrumb onPathClick={this.handleOnPathClick} />
        <NewFolderContainer />
        <div>
          DirectoryContainer
        </div>
      </div>
    )
  }

  handleOnPathClick = (path: string) => history.push(path)
}

const mapStateToProps = (state: GlobalState): DirectoryState => {
  return state.directory
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryContainer)
