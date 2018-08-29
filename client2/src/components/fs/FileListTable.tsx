import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import { distanceInWords } from 'date-fns'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { Checkbox, CircularProgress } from '@material-ui/core'
import classnames = require('classnames')
import { List, ListRowProps, AutoSizer, InfiniteLoader } from 'react-virtualized'

import Routes from 'services/routes'
import { togglePopup } from 'utils/popup'
import { withStore, connect } from 'store/store'
import { showNodeDetails, selectNode, selectAllNodes, deselectNode, deselectAllNodes, getDirectoryContent } from 'store/actions'
import { Directory, FsNode } from 'models/FsNode'
import { FsNodeSelection } from 'store/states/fsState'


const styles = (theme: Theme) => createStyles({
  root: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderTop: 0,
    marginTop: 0,
    transition: 'margin 250ms',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  transition: {
    marginTop: theme.spacing.unit * -3,
    marginBottom: theme.spacing.unit * -3,
    borderBottom: 0,
    transition: 'margin 250ms'
  },
  transitionWithBreadCrumb: {
    marginTop: (theme.spacing.unit * -5) - 40, // Minus size of the breadcrum + extra margin
    marginBottom: theme.spacing.unit * -3,
    borderBottom: 0,
    transition: 'margin 250ms'
  },
  contentTableHead: {
    zIndex: 99,
    boxShadow: 'none',
    backgroundColor: 'white',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0,
    position: 'sticky',
    top: '-16px'
  },
  contentTableBody: {
    flex: 1
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
    whiteSpace: 'nowrap',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
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
    height: '66px',
    alignItems: 'center',
    paddingRight: '61px' // Let space for the menu icon
  },
  contentRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
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

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  /** If the checkboxes should be displayed. By default the checkboxes are hiddens. */
  showCheckboxes: boolean,
  /** Select menu on a specified node. */
  selectedMenu?: { nodeId: string, anchor: HTMLElement }
  /** State of the scroll of the table. */
  scrollTop: number
}

/**
 * Agnostic node list representation, using a table (or at least looking like a table).
 */
class FilesListTable extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)

    this.state = { showCheckboxes: false, selectedMenu: undefined, scrollTop: 0 }
  }

  private onShowNodeDetail(node: FsNode) {
    this.props.onShowNodeDetail(node)
  }

  private onNavigateDirectory(directory: Directory) {
    this.props.onNavigateDirectory(directory)
  }

  private isRowLoaded(index: number) {
    return !!this.props.content[index]
  }

  private onLoadMoreContent() {
    if(!this.props.loading)
      this.props.onLoadMoreContent(this.props.content.length)
    return Promise.resolve()
  }

  private onSelectNode(node: FsNode) {
    this.setState({ showCheckboxes: true })
    this.props.onSelectedNode(node)
  }

  private onSelectAllNodes() {
    this.setState({ showCheckboxes: true })
    this.props.onSelectAllNodes()
  }

  private onDeselectNode(node: FsNode) {
    this.setState({ showCheckboxes: true })
    this.props.onDeselectNode(node)
  }

  private onDeselectAllNodes() {
    this.setState({ showCheckboxes: true })
    this.props.onDeselectAllNodes()
  }

  private onClickNode(node: FsNode) {
    if(node.nodeType === 'DIRECTORY')
      this.onNavigateDirectory(node)
    else
      this.onShowNodeDetail(node)
  }

  private onToggleAllNodesSelection() {
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

  private onToggleMenu<T>(node: FsNode, event: React.SyntheticEvent<T>) {
    const { selectedMenu } = this.state

    event.stopPropagation()

    if(selectedMenu && selectedMenu.nodeId === node.id)
      this.setState({ selectedMenu: undefined })
    else
      this.setState({ selectedMenu: { nodeId: node.id, anchor: event.target as any } })
  }

  private renderLoadingMoreRow(props: ListRowProps): React.ReactElement<{}> {
    const { classes } = this.props

    return (
      <div
        key={"load_more"}
        style={props.style}
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

  private renderRow(props: ListRowProps, node: FsNode): React.ReactElement<{}> {
    const { classes, selection } = this.props
    const { showCheckboxes, selectedMenu } = this.state

    const now = new Date()

    const isSelected = selection.type === 'ALL' || (selection.type === 'SOME' && selection.selectedElements.indexOf(node.id) >= 0)

    const checkbox =
      showCheckboxes ? (
        isSelected ?
          <Checkbox key={node.id + '_checked'} className={classes.contentCheck} checked={true} defaultChecked={true} onClick={() => this.onDeselectNode(node) } /> :
          <Checkbox key={node.id + '_not-checked'} className={classes.contentCheck} onClick={() => this.onSelectNode(node) } />
      ) : <Checkbox key={node.id + '_not-checked'} style={{ display: 'none' }} />

    const icon =
      node.nodeType === 'DIRECTORY' ?
        <DirectoryIcon /> :
        <FileIcon />

    const menu =
      <div>
        <IconButton
          aria-label="More"
          aria-haspopup="true"
          onClick={(e) => this.onToggleMenu(node, e)}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={selectedMenu ? selectedMenu.anchor : undefined}
          open={!!selectedMenu && (selectedMenu.nodeId === node.id)}
          onClose={(e) => this.onToggleMenu(node, e)}
        >
          <MenuItem onClick={(e) => { this.onToggleMenu(node, e); this.onShowNodeDetail(node)}} >Détails</MenuItem>
          <MenuItem>Télécharger</MenuItem>
          <MenuItem>Supprimer</MenuItem>
          <MenuItem>Partager</MenuItem>
        </Menu>
      </div>

    return (
      <div
        className={classnames(classes.contentRow, { [classes.contentRowSelected]: isSelected })}
        key={node.id}
        style={props.style}
        onClick={() => {
          if(!isSelected)
            this.onSelectNode(node)
          else
            this.onDeselectNode(node)
        }}
      >
        <div className={classes.contentCheck}>
          {checkbox}
        </div>
        <Typography variant="body1" className={classnames(classes.contentName, { [classes.contentSelected]: isSelected })}>
          <span className={classnames(classes.contentTypeIcon, { [classes.contentSelected]: isSelected })} >{icon}</span>
          <span className={classes.contentNameValue} onClick={(e) => {this.onClickNode(node); e.stopPropagation()}}>{node.name}</span>
        </Typography>
        <Typography variant="body1" className={classes.contentModification} >
          {distanceInWords(new Date(node.modification), now)}
        </Typography>
        <Typography variant="body1" className={classes.contentSize} >
          {node.nodeType === 'DIRECTORY' ? '-' : node.humanReadableSize}
        </Typography>
        {menu}
      </div>
    )
  }

  render() {
    const { current, content, contentSize, classes, selection } = this.props
    const { showCheckboxes } = this.state

    const marginTop = this.state.scrollTop > 32
    const isRoot = current ? current.path === '/' : true

    // TODO show errors ?
    if(current) {
      return (
        <Paper className={classnames(classes.root, { [classes.transition]: marginTop && isRoot,  [classes.transitionWithBreadCrumb]: marginTop && !isRoot })} >
          <div className={classes.contentTableHead}>
            <div className={classes.contentHeadRow} >
              { showCheckboxes ?
                <div className={classes.contentCheck}>
                  <Checkbox checked={selection.type === 'ALL'} indeterminate={selection.type === 'SOME'} onClick={() => this.onToggleAllNodesSelection()} />
                </div> :
                <span/>
              }
              <Typography variant="caption" className={classes.contentName} >Nom</Typography>
              <Typography variant="caption" className={classes.contentModification} >Modification</Typography>
              <Typography variant="caption" className={classes.contentSize} >Taille</Typography>
            </div>
          </div>
          <div className={classes.contentTableBody} >

            <InfiniteLoader
              isRowLoaded={(props) => this.isRowLoaded(props.index)}
              loadMoreRows={() => this.onLoadMoreContent()}
              rowCount={contentSize}
            >
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer>
                {({ height, width }) => {
                  return (
                    <List 
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      style={{ outline: 'none' }}
                      height={height}
                      width={width}
                      onScroll={(e: any) => this.setState({ scrollTop: e.scrollTop })}
                      rowCount={content.length + (contentSize === content.length ? 0 : 1)}
                      rowHeight={45}
                      rowRenderer={ (props: ListRowProps) =>
                        props.index < content.length ?
                          this.renderRow(props, content[props.index]) :
                          this.renderLoadingMoreRow(props)
                      }
                    />
                  )
                }}
              </AutoSizer>
            )}
            </InfiniteLoader>
          </div>
        </Paper>
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

export default withStore(withStyles(styles) <PropsWithStyle> (FilesListTable), mappedProps)
