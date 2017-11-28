import * as React from "react"
import * as styles from "./DirectoriesContainer.css"
import { connect, Dispatch } from "react-redux"
import { match as RouterMatch } from "react-router"
import * as DirectoriesActions from "directories/DirectoriesActions"
import * as PreviewActions from "preview/PreviewActions"
import { GlobalState } from "store"
import { DirectoriesState } from "directories/DirectoriesReducer"
import AppBar from "components/AppBar"
import Breadcrumb from "components/directory/Breadcrumb"
import { history } from "store"
import NewFolderContainer from "newFolder/NewFolderContainer"
import UploadContainer from "upload/UploadContainer"
import PreviewContainer from "preview/PreviewContainer"
import FsDirectory from "components/directory/FsDirectory"
import FsFile from "components/directory/FsFile"
import { FsNode, FsFile as FsFileModel , isDirectory } from "models/FsNode"
import Empty from "components/directory/Empty"
import Loader from "components/directory/Loader"

interface DispatchProps {
  onFetchDirectory: (path: string) => void
  onDeleteFsNode: (fsNode: FsNode) => void
  onShowPreview: (fsNode?: FsFileModel) => void
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
      <div className={styles.directoriesContainer}>
        <AppBar />
        <div className={styles.actionBar}>
          <Breadcrumb directory={directory} onPathClick={this.handleOnPathClick} />
          <div className={styles.actions}>
            <NewFolderContainer />
            <UploadContainer />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.directories}>
            {!!directory ? this.renderDirectories(directory) : <Loader />}
          </div>
          <PreviewContainer />
        </div>
      </div>
    )
  }

  renderDirectories = (fsNode: FsNode) => {
    if (isDirectory(fsNode)) {
      const content = fsNode.content || []
      if (content.length > 0) {
        return content.map(this.renderFsNode)
      } else {
        return <Empty />
      }
    } else {
      return <Empty />
    }
  }

  renderFsNode = (fsNode: FsNode) => {
    if (fsNode.nodeType === "DIRECTORY") {
      return <FsDirectory key={fsNode.id} fsNode={fsNode} onClick={this.handleDirectoryOnClick} />
    } else {
      return <FsFile key={fsNode.id} fsNode={fsNode} onCancel={this.props.onDeleteFsNode} onShowPreview={this.props.onShowPreview} />
    }
  }

  handleDirectoryOnClick = (fsNode: FsNode) => history.push(`/fs${fsNode.path}`)
  handleOnPathClick = (path: string) => history.push(path)
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): DirectoriesState & Params => {
  return {
    directory: state.directories.directory,
    loading: state.directories.loading,
    deleteLoading: state.directories.deleteLoading,
    error: state.directories.error,
    path: props.match && props.match.params[0]
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onFetchDirectory: path => dispatch(DirectoriesActions.onFetchDirectory(path)),
    onDeleteFsNode: fsNode => dispatch(DirectoriesActions.onDeleteFsNode(fsNode)),
    onShowPreview: fsFile => dispatch(PreviewActions.onShowPreview(fsFile))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoriesContainer)
