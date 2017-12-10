import * as React from "react"
import * as styles from "./DirectoriesContainer.css"
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
import PreviewContainer from "./PreviewContainer"
import FsDirectory from "components/directory/FsDirectory"
import FsFile from "components/directory/FsFile"
import { FsNode, FsFile as FsFileModel , isDirectory } from "models/FsNode"
import { Share } from "models/Share"
import Empty from "components/directory/Empty"
import Loader from "components/directory/Loader"
import { SearchResult } from "models/Search"
import ShareModal from "components/ShareModal"
import LeftPanel from "components/LeftPanel"

interface DispatchProps {
  onFetchDirectory: (path: string) => void
  onDeleteFsNode: (fsNode: FsNode) => void
  onShowPreview: (fsNode?: FsFileModel) => void
  onSharing: (fsNode: FsNode) => void
  onCloseShare: () => void
}

interface PropsState extends DirectoriesState {
  searchResult?: SearchResult
  path?: string
}

type Props = PropsState & DispatchProps

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
    const { directory, share, sharedFsNode } = this.props
    return (
      <div className={styles.directoriesContainer}>
        <LeftPanel />
        <div style={{ flex: 1 }}>
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
              {this.renderResult()}
            </div>
            <PreviewContainer />
            {!!share && !!sharedFsNode ? this.renderShareModal(share, sharedFsNode) : null}
          </div>
        </div>
      </div>
    )
  }

  renderResult = () => {
    const { directory, searchResult } = this.props
    if (!!searchResult) {
      return this.renderFsNodeList(searchResult.items)
    } else if (!!directory) {
      return this.renderDirectories(directory)
    } else {
      return <Loader />
    }
  }

  renderFsNodeList = (fsNode: FsNode[]) => {
    if (fsNode.length > 0) {
      return fsNode.map(this.renderFsNode)
    } else {
      return <Empty />
    }
  }

  renderDirectories = (fsNode: FsNode) => {
    if (isDirectory(fsNode)) {
      const content = fsNode.content || []
      return this.renderFsNodeList(content)
    } else {
      return <Empty />
    }
  }

  renderFsNode = (fsNode: FsNode) => {
    if (isDirectory(fsNode)) {
      return (
        <FsDirectory
          key={fsNode.id}
          fsDirectory={fsNode}
          onClick={this.handleDirectoryOnClick}
          onDelete={this.props.onDeleteFsNode}
        />
      )
    } else {
      return (
        <FsFile
          key={fsNode.id}
          fsFile={fsNode}
          onDelete={this.props.onDeleteFsNode}
          onShowPreview={this.props.onShowPreview}
          onSharing={this.props.onSharing}
        />
      )
    }
  }

  renderShareModal = (share: Share, sharedFsNode: FsNode) => {
    const { onCloseShare } = this.props
    return <ShareModal share={share} sharedFsNode={sharedFsNode} onClose={onCloseShare} />
  }

  handleDirectoryOnClick = (fsNode: FsNode) => history.push(`/fs${fsNode.path}`)

  handleOnPathClick = (path: string) => history.push(path)

}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): PropsState => {
  return {
    ...state.directories,
    searchResult: state.search.searchResult,
    path: props.match && props.match.params[0]
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onFetchDirectory: path => dispatch(DirectoriesActions.onFetchDirectory(path)),
    onDeleteFsNode: fsNode => dispatch(DirectoriesActions.onDeleteFsNode(fsNode)),
    onShowPreview: fsFile => dispatch(DirectoriesActions.onShowPreview(fsFile)),
    onSharing: fsNode => dispatch(DirectoriesActions.onSharing(fsNode)),
    onCloseShare: () => dispatch(DirectoriesActions.onCloseShare()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoriesContainer)
