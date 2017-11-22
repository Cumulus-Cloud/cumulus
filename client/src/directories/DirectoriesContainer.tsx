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
import UploadContainer from "upload/UploadContainer"
import FsDirectory from "components/directory/FsDirectory"
import FsFile from "components/directory/FsFile"
import { FsNode } from "models/FsNode"

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
    onFetchDirectory(!!path ? `/${path}` : "/")
  }

  componentWillReceiveProps(nextProps: Props) {
    const { path, onFetchDirectory } = this.props
    if (path !== nextProps.path) {
      onFetchDirectory(!!nextProps.path ? `/${nextProps.path}` : "/")
    }
  }

  render() {
    const { directory } = this.props
    return (
      <div>
        <AppBar />
        <Breadcrumb directory={directory} onPathClick={this.handleOnPathClick} />
        <NewFolderContainer />
        <UploadContainer />
        <div>
          {!!directory ? this.renderDirectories(directory) : <div>Loading</div>}
        </div>
      </div>
    )
  }

  renderDirectories = (directory: FsNode) => {
    return (directory.content || []).map(fsNode => {
      if (fsNode.nodeType === "DIRECTORY") {
        return <FsDirectory key={fsNode.id} fsNode={fsNode} onClick={this.handleDirectoryOnClick} />
      } else {
        return <FsFile key={fsNode.id} fsNode={fsNode} />
      }
    })
  }

  handleDirectoryOnClick = (fsNode: FsNode) => history.push(`/fs${fsNode.path}`)
  handleOnPathClick = (path: string) => history.push(path)
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): DirectoriesState & Params => {
  return {
    directory: state.directories.directory,
    loading: state.directories.loading,
    error: state.directories.error,
    path: props.match && props.match.params[0]
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onFetchDirectory: path => dispatch(DirectoriesActions.onFetchDirectory(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoriesContainer)
