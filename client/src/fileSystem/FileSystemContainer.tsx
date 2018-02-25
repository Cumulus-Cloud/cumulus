import * as React from "react"
import * as styles from "./FileSystemContainer.css"
import { connect, Dispatch } from "react-redux"
import { match as RouterMatch } from "react-router"
import * as FileSystemActions from "./FileSystemActions"
import * as MoveActions from "move/MoveActions"
import { GlobalState, history } from "store"
import { FileSystemState } from "./FileSystemReducer"
import AppBar from "components/AppBar"
import Breadcrumb from "components/breadcrumb/Breadcrumb"
import PreviewContainer from "./PreviewContainer"
import { FsNode, FsFile, isDirectory, isFile, FsDirectory } from "models/FsNode"
import { Share } from "models/Share"
import Empty from "components/Empty"
import Loader from "components/Loader"
import { SearchResult } from "models/Search"
import ShareModal from "components/ShareModal"
import LeftPanel from "components/LeftPanel"
import RightPanel from "components/RightPanel"
import FsNodeComponent from "components/FsNodeComponent"
import MoveModal from "move/MoveModal"

interface DispatchProps {
  onFetchDirectory(path: string): void
  onDeleteFsNode(fsNode: FsNode): void
  onShowFsNodeInfos(fsNode: FsNode): void
  onSelectFsNode(fsNode: FsNode): void
  onShowPreview(fsNode?: FsFile): void
  onSharing(fsNode: FsNode): void
  onWantMove(fsNodes: FsNode[], target: FsDirectory): void
  onCloseShare(): void
}

interface PropsState extends FileSystemState {
  searchResult?: SearchResult
  path?: string
  wantMove: boolean
}

type Props = PropsState & DispatchProps

class FileSystemContainer extends React.PureComponent<Props> {

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
    const { directory, share, wantMove, sharedFsNode } = this.props
    return (
      <div className={styles.fileSystemContainer}>
        <LeftPanel />
        <div className={styles.mainContainer}>
          <AppBar />
          <div className={styles.filesContainer}>
            <div className={styles.content}>
              <Breadcrumb homeTitle={Messages("ui.appName")} directory={directory} onPathClick={this.handleOnPathClick} />
              <div className={styles.directories}>
                {this.renderResult()}
              </div>
              <PreviewContainer />
              {!!share && !!sharedFsNode ? this.renderShareModal(share, sharedFsNode) : null}
              {wantMove ? <MoveModal /> : null }
            </div>
            <RightPanel />
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
    const { onSelectFsNode, onDeleteFsNode, onSharing, onShowFsNodeInfos, selectedFsNodes, directory } = this.props
    return (
      <FsNodeComponent
        key={fsNode.id}
        selected={!!selectedFsNodes.find(n => n.id === fsNode.id)}
        fsNode={fsNode}
        onSelect={onSelectFsNode}
        onOpen={this.handleOnOpenFsNode}
        onDelete={onDeleteFsNode}
        onSharing={onSharing}
        onShowInfo={onShowFsNodeInfos}
        onWantMove={this.handleOnWantMove(directory!)}
      />
    )
  }

  renderShareModal = (share: Share, sharedFsNode: FsNode) => {
    const { onCloseShare } = this.props
    return <ShareModal share={share} sharedFsNode={sharedFsNode} onClose={onCloseShare} />
  }

  handleOnOpenFsNode = (fsNode: FsNode) => {
    if (isFile(fsNode)) {
      this.props.onShowPreview(fsNode)
    } else {
      history.push(`/fs${fsNode.path}`)
    }
  }

  handleOnPathClick = (path: string) => history.push(`/fs/${path}`)
  handleOnWantMove = (target: FsDirectory) => (fsNode: FsNode) => this.props.onWantMove([fsNode], target)
}

const mapStateToProps = (state: GlobalState, props: { match?: RouterMatch<string[]> }): PropsState => {
  return {
    ...state.fileSystem,
    searchResult: state.search.searchResult,
    path: props.match && props.match.params[0],
    wantMove: state.move.wantMove,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onFetchDirectory: path => dispatch(FileSystemActions.fetchDirectory(path)),
    onDeleteFsNode: fsNode => dispatch(FileSystemActions.onDeleteFsNode(fsNode)),
    onShowPreview: fsFile => dispatch(FileSystemActions.onShowPreview(fsFile)),
    onSharing: fsNode => dispatch(FileSystemActions.onSharing(fsNode)),
    onCloseShare: () => dispatch(FileSystemActions.onCloseShare()),
    onShowFsNodeInfos: fsNode => dispatch(FileSystemActions.showFsNodeInfos(fsNode)),
    onSelectFsNode: fsNode => dispatch(FileSystemActions.selectFsNode(fsNode)),
    onWantMove: (fsNodes, target) => dispatch(MoveActions.wantMove(fsNodes, target)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FileSystemContainer)
