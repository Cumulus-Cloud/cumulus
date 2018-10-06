import React from 'react'
import ReactDOM from 'react-dom'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { distanceInWords } from 'date-fns'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fade from '@material-ui/core/Fade'

import classnames from 'classnames';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

import { withStore, connect } from 'store/store'
import { FsNodeSelection } from 'store/states/fsState'

import { WithDragAndDrop, withDragAndDrop, DraggingInfo } from 'components/utils/DragAndDrop'
import NodeIcon, { NodesIcon } from 'components/fs/list/NodeIcon'
import Resize from 'components/utils/Resize'

import { Directory, FsNode } from 'models/FsNode'

import { showNodeDetails, selectNode, selectAllNodes, deselectNode, deselectAllNodes, getDirectoryContent } from 'store/actions/directory'

import { togglePopup } from 'utils/popup'

import Routes from 'services/routes'


const styles = (theme: Theme) => createStyles({
  root: {
    boxShadow: 'none',
    borderTop: 0,
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    transform: 'none',
    flex: 1
  },
  contentTableHead: {
    zIndex: 99,
    boxShadow: 'none',
    backgroundColor: 'white',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0
  },
  contentTableBody: {
    flex: 1,
    display: 'flex'
  },
  contentTypeIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit
  },
  contentCheck: {
    marginRight: '-6px',
    zIndex: 9 // Fix checkbox passing through header
  },
  contentName: {
    margin: 0,
    flex: 4,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  },
  contentNameValue: {
    whiteSpace: 'nowrap',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  contentModification: {
    flex: 2,
    padding: theme.spacing.unit * 2
  },
  contentSize: {
    flex: 1,
    padding: theme.spacing.unit * 2
  },
  contentSelected: {
    color: theme.palette.primary.light
  },
  contentHeadRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    height: '45px',
    alignItems: 'center',
    paddingRight: '61px' // Let space for the menu icon
  },
  contentRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
    height: '45px',
    alignItems: 'center',
    ['&:hover'] : {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  contentRowSelected: {
    backgroundColor: 'rgba(41, 167, 160, 0.08)',
    color: theme.palette.primary.light,
    ['&:hover'] : {
      backgroundColor: 'rgba(41, 167, 160, 0.18)'
    }
  },
  rowLoadMore: {
    width: '100%',
    height: '100%',
    borderRadius: 0
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderSpinner: {
    display: 'block',
    marginRight: theme.spacing.unit,
    marginBottom: 0
  },
  loaderText: {
    display: 'flex',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

interface Props {
  /** When details for a node are requested. */
  onShowNodeDetail: (node: FsNode) => void
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
  /** When more content needs to be loaded. */
  onLoadMoreContent: (offset: number) => void
  /** Callback for the parent component. */
  onPathChanged: () => void
  /** If more content is loading. */
  loading: boolean
  /** If there is more content to load. */
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
    if(node.nodeType === 'DIRECTORY')
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

  onToggleMenu<T>(node: FsNode, event: React.SyntheticEvent<T>) {
    const { selectedMenu } = this.state

    event.stopPropagation()

    if(selectedMenu && selectedMenu.nodeId === node.id)
      this.setState({ selectedMenu: undefined })
    else
      this.setState({ selectedMenu: { nodeId: node.id, anchor: event.target as any } })
  }

  renderRow = (props: ListChildComponentProps): React.ReactElement<{}> => {
    const { content } = this.props

    if(props.index >= content.length)
      return this.renderLoadingRow(props)
    else
      return this.renderElementRow(props as ListChildComponentProps & { isScrolling: boolean }) // Trust me

  }

  renderLoadingRow = ({ style }: ListChildComponentProps): React.ReactElement<{}> => {
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

  selectedNodes() {
    const { selection, content } = this.props

    if(selection.type === 'ALL')
      return content
    else if(selection.type === 'SOME')
      return content.filter((n) =>  selection.selectedElements.indexOf(n.id) >= 0)
    else
      return []
  }

  isNodeSelected(node: FsNode) {
    const { selection } = this.props

    if(selection.type === 'ALL')
      return true
    else if(selection.type === 'SOME')
      return selection.selectedElements.indexOf(node.id) >= 0
    else
      return false
  }

  renderElementRow = ({ index, isScrolling, style }: ListChildComponentProps & { isScrolling: boolean }): React.ReactElement<{}> => {
    const { classes, content, Draggable, DropZone } = this.props
    const { showCheckboxes, selectedMenu } = this.state

    const now = new Date()
    const node = content[index]

    //const isDragged = dragInfo && dragInfo.value.id === node.id
    const isSelected = this.isNodeSelected(node)

    const checkbox =
      showCheckboxes ? (
        isSelected ?
          <Checkbox key={ node.id + '_checked' } className={ classes.contentCheck} checked defaultChecked onClick={() => this.onDeselectNode(node) } /> :
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
            <MenuItem>Supprimer</MenuItem>
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
        <DropZone onDrop={(dropped) => console.log('dropped ', dropped, ' on ', node.path)} >
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
              { node.nodeType === 'DIRECTORY' ? '-' : node.humanReadableSize }
            </Typography>
            {menu}
          </div>
        </DropZone>
      </Draggable>
    )
  }

  render() {
    const { current, content, contentSize, classes, selection } = this.props
    const { showCheckboxes } = this.state
     
    // TODO show errors ?
    if(current) {
      return (
        <>
          <Paper className={classes.root} >
            <div className={classes.contentTableHead}>
              <div className={classes.contentHeadRow} >
                { showCheckboxes ?
                  <div className={classes.contentCheck}>
                    <Checkbox checked={selection.type === 'ALL'} indeterminate={selection.type === 'SOME'} onClick={() => this.onToggleAllNodesSelection()} />
                  </div> :
                  <span/>
                }
                <Typography variant="caption" noWrap className={classes.contentName} >Nom</Typography>
                <Typography variant="caption" className={classes.contentModification} >Modification</Typography>
                <Typography variant="caption" className={classes.contentSize} >Taille</Typography>
              </div>
            </div>
            <div className={classes.contentTableBody}>
              <Resize style={{ flex: 1 }} >
                { ({ height }) =>
                  <List
                    height={height}
                    width="inherit"
                    useIsScrolling
                    itemCount={content.length + (contentSize === content.length ? 0 : 1)}
                    itemSize={45}
                    overscanCount={5}
                    itemKey={(index) => {
                      const { content } = this.props
                      return index >= content.length ? 'loading' : content[index].id
                    }}
                    onItemsRendered={({ visibleStopIndex }) => {
                      const { contentSize, content } = this.props
                      const loadedContentSize = content.length

                      // Load when more than 75% is shown
                      if((visibleStopIndex > loadedContentSize * 0.7) && loadedContentSize < contentSize ) {
                        this.onLoadMoreContent()
                      }
                    }}
                  >
                    { this.renderRow }
                  </List>
                }
              </Resize>
            </div>
          </Paper>
        </>
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
      dispatch(showNodeDetails(node.id)) // TODO pass in popup path...
      togglePopup('NODE_DETAILS', true, node.name)(router)
    },
    onNavigateDirectory: (directory: Directory) => {
      router.push(`${Routes.app.fs}${directory.path}`)
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
    onLoadMoreContent: () => {
      dispatch(getDirectoryContent())
    }
  }))


// Root element for the dragging placeholder
const draggedElementRoot = document.getElementById('app-dragged')

// Dragging placeholder static component
const renderDraggedElement =
  (dragInfo: DraggingInfo<FsNode[]>): React.ReactNode => {
    if(draggedElementRoot) {
      const { x, y, value: nodes } = dragInfo

      // TODO style from a style element
      return (
        // Note: we need to a use a portal because material UI animations
        // use the transform CSS properties and break the fixed position
        ReactDOM.createPortal(
          <Fade in timeout={800} unmountOnExit={false} >
            <Paper
              style={{
                maxWidth: 225,
                padding: 8,
                paddingRight: 15,
                position: 'fixed',
                alignItems: 'center',
                pointerEvents: 'none',
                display: 'flex',
                zIndex: 9999,
                transform: `translate(${x}px, ${y}px)`,
                top: 0,
                left: 0
              }}
              key="dragged"
            >
              {
                nodes.length === 1 ? (
                  <>
                    <NodeIcon node={ nodes[0] } />
                    <Typography variant="body1" noWrap style={{ flex: 1 }} >
                      { nodes[0].name }
                    </Typography>
                  </>
                ): (
                  <>
                    <NodesIcon />
                    <Typography variant="body1" noWrap style={{ flex: 1 }} >
                      { `${nodes.length} éléments` }
                    </Typography>
                  </>
                )
              }
            </Paper>
          </Fade>,
          draggedElementRoot 
        )
      )
    } else
      return null
  }

export default withDragAndDrop(
  withStore(withStyles(styles)(FilesListTable), mappedProps),
  renderDraggedElement
)

