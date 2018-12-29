import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import { distanceInWords } from 'date-fns'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import classnames from 'classnames'

import { withStore, connect } from 'store/store'
import { FsNodeSelection, selectedNodes, isNodeSelected } from 'store/states/fsState'

import { WithDragAndDrop } from 'components/utils/DragAndDrop'
import NodeIcon from 'components/fs/NodeIcon'
import Table from 'components/utils/Table/InfiniteScrollTable'

import { Directory, FsNode, isDirectory } from 'models/FsNode'

import { selectNode, selectAllNodes, deselectNode, deselectAllNodes, getDirectoryContent } from 'store/actions/directory'
import { showPopup } from 'store/actions/popups'

import Routes from 'services/routes'
import { moveNodes } from 'store/actions/nodeDisplacement'

import styles from './styles'

interface Props {
  /** When details for a node are requested. */
  onShowNodeDetail: (node: FsNode) => void
  /** When a node is deleted. */
  onDeleteNode: (node: FsNode) => void
  /** When a directory is selected, to change the viewer current directory. */
  onNavigateDirectory: (directory: Directory) => void
  /** When a node is selected. */
  onSelectedNode: (node: FsNode) => void
  /** When all node are selected. */
  onSelectAllNodes: () => void
  /** When a node is deselected. */
  onDeselectNode: (node: FsNode) => void
  /** When all node are deselected. */
  onDeselectAllNodes: () => void
  /** On moved nodes */
  onMoveNodes: (nodes: FsNode[], destination: string) => void,
  /** When more content needs to be loaded. */
  onLoadMoreContent: (offset: number) => void
  /** Callback for the parent component. */
  onPathChanged: () => void
  /** If more content is loading. */
  loading: boolean
  /** Current node */
  current?: Directory
  /** Content of the loaded current directory. */
  content: FsNode[]
  /** Maximum number of contained node. */
  contentSize: number
  /** List of selected nodes. */
  selection: FsNodeSelection
}


type PropsWithStyle = Props & WithStyles<typeof styles> & WithDragAndDrop<FsNode[]>

interface State {
  /** If the checkboxes should be displayed. By default the checkboxes are hiddens. */
  showCheckboxes: boolean,
  /** Select menu on a specified node. */
  selectedMenu?: { nodeId: string, anchor: HTMLElement }
}

/**
 * Agnostic node list representation, using a table (or at least looking like a table).
 */
class FilesListTable extends React.Component<PropsWithStyle, State> {

  state: State = { showCheckboxes: false, selectedMenu: undefined }

  onShowNodeDetail(node: FsNode) {
    this.props.onShowNodeDetail(node)
  }

  onDeleteNode(node: FsNode) {
    this.props.onDeleteNode(node)
  }

  onNavigateDirectory(directory: Directory) {
    this.props.onPathChanged()
    this.props.onNavigateDirectory(directory)
  }

  isRowLoaded(index: number) {
    return !!this.props.content[index]
  }

  onLoadMoreContent() {
    if(!this.props.loading)
      this.props.onLoadMoreContent(this.props.content.length)
    return Promise.resolve()
  }

  onSelectNode(node: FsNode) {
    this.setState({ showCheckboxes: true })
    this.props.onSelectedNode(node)
  }

  onSelectAllNodes() {
    this.setState({ showCheckboxes: true })
    this.props.onSelectAllNodes()
  }

  onDeselectNode(node: FsNode) {
    this.setState({ showCheckboxes: true })
    this.props.onDeselectNode(node)
  }

  onDeselectAllNodes() {
    this.setState({ showCheckboxes: true })
    this.props.onDeselectAllNodes()
  }

  onClickNode(node: FsNode) {
    if(isDirectory(node))
      this.onNavigateDirectory(node)
    else
      this.onShowNodeDetail(node)
  }

  onToggleAllNodesSelection() {
    const { selection } = this.props

    switch(selection.type) {
      case 'ALL':
        return this.onDeselectAllNodes()
      case 'NONE':
        return this.onSelectAllNodes()
      case 'SOME':
        return this.onSelectAllNodes()
    }
  }

  selectedNodes() {
    const { selection, content } = this.props

    return selectedNodes(content, selection)
  }

  isNodeSelected(node: FsNode) {
    const { selection } = this.props

    return isNodeSelected(node, selection)
  }

  onToggleMenu<T>(node: FsNode, event: React.SyntheticEvent<T>) {
    const { selectedMenu } = this.state

    event.stopPropagation()

    if(selectedMenu && selectedMenu.nodeId === node.id)
      this.setState({ selectedMenu: undefined })
    else
      this.setState({ selectedMenu: { nodeId: node.id, anchor: event.target as any } })
  }

  onMoveNodes(nodes: FsNode[], destination: FsNode) {
    if(isDirectory(destination))
      this.props.onMoveNodes(nodes, destination.path)
  }

  renderLoadingRow = (style: React.CSSProperties): React.ReactElement<{}> => {
    const { classes } = this.props

    return (
      <div
        style={style}
        className={classes.loader}
      >
        <div className={classes.loaderSpinner} >
          <CircularProgress size={20} color="primary"/>
        </div>
        <Typography variant="caption" className={classes.loaderText} >
          {'Chargement de plus de contenu..'}
        </Typography>
      </div>
    )
  }

  renderElementRow = (node: FsNode, style: React.CSSProperties, isScrolling: boolean): JSX.Element => {
    const { classes, Draggable, DropZone } = this.props
    const { showCheckboxes, selectedMenu } = this.state

    const now = new Date()

    //const isDragged = dragInfo && dragInfo.value.id === node.id
    const isSelected = this.isNodeSelected(node)

    const checkbox =
      showCheckboxes ? (
        isSelected ?
          <Checkbox key={ node.id + '_checked' } className={ classes.contentCheck} checked onClick={() => this.onDeselectNode(node) } /> :
          <Checkbox key={ node.id + '_not-checked' } className={ classes.contentCheck } onClick={() => this.onSelectNode(node) } />
      ) : <Checkbox key={ node.id + '_not-checked' } style={ { display: 'none' } } />

    const menu =
      <div>
        <IconButton onClick={ (e) => this.onToggleMenu(node, e) } >
          <MoreVertIcon />
        </IconButton>
        {
          !isScrolling &&
          <Menu
            id="simple-menu"
            anchorEl={ selectedMenu ? selectedMenu.anchor : undefined }
            open={ !!selectedMenu && (selectedMenu.nodeId === node.id) }
            onClose={ (e) => this.onToggleMenu(node, e) }
          >
            <MenuItem onClick={ (e) => { this.onToggleMenu(node, e); this.onShowNodeDetail(node)} } >Détails</MenuItem>
            <MenuItem>Télécharger</MenuItem>
            <MenuItem onClick={ (e) => { this.onToggleMenu(node, e); this.onDeleteNode(node) }} >Supprimer</MenuItem>
            <MenuItem>Partager</MenuItem>
          </Menu>
        }
      </div>

    return (
      <Draggable
        onDrag={() => {
          const selected = this.selectedNodes()
          return isSelected && selected.length > 0 ? selected : [ node ]
        }}
      >
        <DropZone onDrop={(dropped) => this.onMoveNodes(dropped, node)} >
          <div
            className={ classnames(classes.contentRow, { [classes.contentRowSelected]: isSelected }) }
            style={ style }
            onClick={() => {
              if(!isSelected)
                this.onSelectNode(node)
              else
                this.onDeselectNode(node)
            }}
          >
            <div className={ classes.contentCheck }>
              { checkbox }
            </div>
            <Typography variant="body1" noWrap className={ classnames(classes.contentName, { [classes.contentSelected]: isSelected }) }>
              <NodeIcon node={ node } selected={ isSelected } />
              <span className={ classes.contentNameValue } onClick={(e) => { this.onClickNode(node); e.stopPropagation()} }>{node.name}</span>
            </Typography>
            <Typography variant="body1" className={ classes.contentModification } >
              { distanceInWords(new Date(node.modification), now) }
            </Typography>
            <Typography variant="body1" className={ classes.contentSize } >
              { isDirectory(node) ? '-' : node.humanReadableSize }
            </Typography>
            {menu}
          </div>
        </DropZone>
      </Draggable>
    )
  }

  render() {
    const { current, content, contentSize, classes, selection, loading } = this.props
    const { showCheckboxes } = this.state

    const header = (
      <>
        { showCheckboxes ?
          <div className={classes.contentCheck}>
            <Checkbox checked={selection.type === 'ALL'} indeterminate={selection.type === 'SOME'} onClick={() => this.onToggleAllNodesSelection()} />
          </div> :
          <span/>
        }
        <Typography variant="caption" noWrap className={classes.contentName} >Nom</Typography>
        <Typography variant="caption" className={classes.contentModification} >Modification</Typography>
        <Typography variant="caption" className={classes.contentSize} >Taille</Typography>
      </>
    )

    if(current) {
      return (
        <Table<FsNode>
          elements={ content }
          elementsSize={ contentSize }
          rowHeight={ 45 }
          header={ header }
          renderRow={ this.renderElementRow }
          renderLoadingRow={ this.renderLoadingRow }
          elementKey={ (node) => node.id }
          onLoadMoreElements={ (offset) => this.props.onLoadMoreContent(offset) }
          loading={ loading }
        />
      )
    } else
      return null
  }

}


const mappedProps =
  connect(({ fs, router }, dispatch) => ({
    loading: fs.loadingContent,
    current: fs.current,
    content: fs.content || [],
    contentSize: fs.contentSize || 0,
    selection: fs.selectedContent,
    onShowNodeDetail: (node: FsNode) => {
      dispatch(showPopup({ type: 'NODE_DETAIL', nodes: [ node ] }))
    },
    onDeleteNode: (node: FsNode) => {
      dispatch(showPopup({ type: 'NODE_DELETION', nodes: [ node ] }))
    },
    onNavigateDirectory: (directory: Directory) => {
      router.push(`${Routes.app.fs}${directory.path}`) // TODO inside an action
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
    onMoveNodes: (nodes: FsNode[], destination: string) => {
      dispatch(moveNodes({ nodes, destination }))
    },
    onLoadMoreContent: () => {
      dispatch(getDirectoryContent())
    }
  }))

export default withStore(withStyles(styles)(FilesListTable), mappedProps)
