import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { match as RouterMatch } from "react-router"
import * as DirectoriesActions from "directories/DirectoriesActions"
import { GlobalState } from "store"
import { DirectoriesState } from "directories/DirectoriesReducer"
import AppBar from "components/AppBar"
import Breadcrumb from "components/directory/Breadcrumb"
import { history } from "store"
import NewFolderContainer from "newFolder/NewFolderContainer"
import FsDirectory from "components/directory/FsDirectory"
import FsFile from "components/directory/FsFile"
import { Directory } from "models/FsNode"

interface DispatchProps {
  onFetchDirectory: (path: string) => void
}

interface Params {
  path?: string
}

type Props = DirectoriesState & DispatchProps & Params

class DirectoriesContainer extends React.PureComponent<Props> {

  componentWillMount() {
    const { path, onFetchDirectory } = this.props
    console.log("DirectoriesContainer.componentWillMount", path)
    onFetchDirectory(!!path ? path : "/")
  }

  render() {
    const { directory } = this.props
    return (
      <div>
        <AppBar />
        <Breadcrumb onPathClick={this.handleOnPathClick} />
        <NewFolderContainer />
        <div>
          {!!directory ? this.renderDirectories(directory) : <div>Loading</div>}
        </div>
      </div>
    )
  }

  renderDirectories = (directory: Directory) => {
    console.log("renderDirectories", directory)
    return (directory.content || []).map(fsNode => {
      if (fsNode.type === "directory") {
        return <FsDirectory key={fsNode.id} fsNode={fsNode} />
      } else {
        return <FsFile key={fsNode.id} fsNode={fsNode} />
      }
    })
  }

  handleOnPathClick = (path: string) => history.push(path)
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<Params> }): DirectoriesState & Params => {
  console.log(state)
  return {
    directory: state.directories.directory,
    loading: state.directories.loading,
    error: state.directories.error,
    path: props.match && props.match.params.path
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onFetchDirectory: path => dispatch(DirectoriesActions.onFetchDirectory(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoriesContainer)
