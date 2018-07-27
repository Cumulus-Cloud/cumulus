import { connect, Dispatch } from 'react-redux'

import GlobalState from '../../actions/state'
import { getDirectoryContent, selectNode, selectAllNodes, deselectNode, deselectAllNodes, showNodeDetails } from '../../actions/fs/fsActions'
import { togglePopup } from './../../actions/popup/popupActions'
import FilesListTable from './FileListTable'
import { push } from 'connected-react-router'
import Routes from '../../services/routes';
import { FsNode, Directory } from '../../models/FsNode';
import { withRouter, RouteComponentProps } from 'react-router';

function mapStateToProps(state: GlobalState) {
  return {
    loading: state.fs.loadingContent,
    hasMore: true, // TODO detect if more content is available
    content: state.fs.content || [],
    selection: state.fs.selectedContent
  }
}

function mapDispatchToProps(dispatch: Dispatch, props: RouteComponentProps<{}>) {
  return {
    onShowNodeDetail: (node: FsNode) => {
      dispatch(showNodeDetails(node.id)) // TODO pass in popup path...
      dispatch(togglePopup('NODE_DETAILS', true, node.name)(props.location))
    },
    onNavigateDirectory: (directory: Directory) => {
      dispatch(push(`${Routes.app.fs}${directory.path}`))
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FilesListTable))
