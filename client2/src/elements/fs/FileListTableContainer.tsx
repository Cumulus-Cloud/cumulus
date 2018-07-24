import { connect, Dispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'

import GlobalState from '../../actions/state'
import { getDirectory, getDirectoryContent, selectNode, selectAllNodes, deselectNode, deselectAllNodes, showNodeDetails } from '../../actions/fs/fsActions'
import { PopupTypes, togglePopup } from './../../actions/popup/popupActions'
import FilesListTable from './FileListTable'
import { push } from 'connected-react-router'
import Routes from '../../services/routes';
import { FsNode, Directory } from '../../models/FsNode';

function mapStateToProps(state: GlobalState) {
  return {
    loading: state.fs.loadingContent,
    hasMore: true, // TODO detect if more content is available
    content: state.fs.content || [],
    selection: state.fs.selectedContent
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: GlobalState) {
  return {
    onShowNodeDetail: (node: FsNode) => {
      dispatch(showNodeDetails(node.id))
      dispatch(togglePopup(PopupTypes.nodeDetails, true))
    },
    onNavigateDirectory: (directory: Directory) => {
      dispatch(push(`${Routes.app.fs}${directory.path}`))
      dispatch(getDirectory(directory.path))
    },
    onSelectedNode: (node: FsNode) => {
      dispatch(selectNode(node.id))
    },
    onSelectAllNodes: () => {
      dispatch(selectAllNodes())
    },
    onDeselectNode: (node: FsNode) => {
      dispatch(deselectNode(node.id))
    },
    onDeselectAllNodes: () => {
      dispatch(deselectAllNodes())
    },
    onLoadMoreContent: (offset: number) => {
      dispatch(getDirectoryContent(offset))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FilesListTable)) // TODO typing
