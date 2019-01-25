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

import { selectedNodes, isNodeSelected } from 'store/states/fsState'
import { useFilesystem, usePopups, useRouting, useNodeDisplacement } from 'store/storeHooks'

import { WithDragAndDrop } from 'components/utils/DragAndDrop'
import NodeIcon from 'components/fs/NodeIcon'
import Table from 'components/utils/Table/InfiniteScrollTable'

import { Directory, FsNode, isDirectory } from 'models/FsNode'

import styles from './styles'


interface Props {
  /** Callback for the parent component. */
  onPathChanged: () => void
}

type PropsWithStyle = Props & WithStyles<typeof styles> & WithDragAndDrop<FsNode[]>


function FilesListTable(props: PropsWithStyle) {

  const [showCheckboxes, setShowCheckboxes] = React.useState(false)
  const [selectedMenu, setSelectedMenu] = React.useState<{ nodeId: string, anchor: HTMLElement } | undefined>(undefined)

  const {
    current,
    loadingContent,
    content,
    contentSize,
    selectedContent,
    selectNode,
    deselectNode,
    selectAllNodes,
    deselectAllNodes,
    getDirectoryContent
  } = useFilesystem()
  const { moveNodes } = useNodeDisplacement()
  const { showPopup } = usePopups()
  const { showFs } = useRouting()

  const { classes, Draggable, DropZone } = props

  const showNodeDetail = (node: FsNode) => {
    showPopup('NODE_DETAIL', [ node ])
  }

  const showDeleteNode = (node: FsNode) => {
    showPopup('NODE_DELETION', [ node ])
  }

  const navigateDirectory = (directory: Directory) => {
    props.onPathChanged()
    showFs(directory.path)
  }

  const loadMoreContent = () => {
    if(!loadingContent)
      getDirectoryContent()
    return Promise.resolve()
  }

  const onSelectNode = (node: FsNode) => {
    setShowCheckboxes(true)
    selectNode(node.id)
  }

  const onSelectAllNodes = () => {
    setShowCheckboxes(true)
    selectAllNodes()
  }

  const onDeselectNode = (node: FsNode) => {
    setShowCheckboxes(true)
    deselectNode(node.id)
  }

  const onDeselectAllNodes = () => {
    setShowCheckboxes(true)
    deselectAllNodes()
  }

  const onClickNode = (node: FsNode) => {
    if(isDirectory(node))
      navigateDirectory(node)
    else
      showNodeDetail(node)
  }

  const onToggleAllNodesSelection = () => {
    switch(selectedContent.type) {
      case 'ALL':
        return onDeselectAllNodes()
      case 'NONE':
        return onSelectAllNodes()
      case 'SOME':
        return onSelectAllNodes()
    }
  }

  const toggleMenu = (node: FsNode, event: React.SyntheticEvent<any>) => {
    event.stopPropagation()

    if(selectedMenu && selectedMenu.nodeId === node.id)
      setSelectedMenu(undefined)
    else
      setSelectedMenu({ nodeId: node.id, anchor: event.target as any })
  }

  const onMoveNodes = (nodes: FsNode[], destination: FsNode) => {
    if(isDirectory(destination))
      moveNodes(nodes, destination.path)
  }

  const renderLoadingRow = (style: React.CSSProperties): React.ReactElement<{}> => {
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

  const renderElementRow = (node: FsNode, style: React.CSSProperties, isScrolling: boolean): JSX.Element => {
    const now = new Date()

    //const isDragged = dragInfo && dragInfo.value.id === node.id
    const isSelected = isNodeSelected(node, selectedContent)

    const checkbox =
      showCheckboxes ? (
        isSelected ?
          <Checkbox key={ node.id + '_checked' } className={ classes.contentCheck} checked onClick={() => onDeselectNode(node) } /> :
          <Checkbox key={ node.id + '_not-checked' } className={ classes.contentCheck } onClick={() => onSelectNode(node) } />
      ) : <Checkbox key={ node.id + '_not-checked' } style={ { display: 'none' } } />

    const menu =
      <div>
        <IconButton onClick={ (e) => toggleMenu(node, e) } >
          <MoreVertIcon />
        </IconButton>
        {
          !isScrolling &&
          <Menu
            id="simple-menu"
            anchorEl={ selectedMenu ? selectedMenu.anchor : undefined }
            open={ !!selectedMenu && (selectedMenu.nodeId === node.id) }
            onClose={ (e) => toggleMenu(node, e) }
          >
            <MenuItem onClick={ (e) => { toggleMenu(node, e); showNodeDetail(node) } } >Détails</MenuItem>
            <MenuItem>Télécharger</MenuItem>
            <MenuItem onClick={ (e) => { toggleMenu(node, e); showDeleteNode(node) }} >Supprimer</MenuItem>
            <MenuItem>Partager</MenuItem>
          </Menu>
        }
      </div>

    return (
      <Draggable
        onDrag={() => {
          const selected = selectedNodes(content || [], selectedContent)
          return isSelected && selected.length > 0 ? selected : [ node ]
        }}
      >
        <DropZone onDrop={(dropped) => onMoveNodes(dropped, node)} >
          <div
            className={ classnames(classes.contentRow, { [classes.contentRowSelected]: isSelected }) }
            style={ style }
            onClick={() => {
              if(!isSelected)
                onSelectNode(node)
              else
                onDeselectNode(node)
            }}
          >
            <div className={ classes.contentCheck }>
              { checkbox }
            </div>
            <Typography variant="body1" noWrap className={ classnames(classes.contentName, { [classes.contentSelected]: isSelected }) }>
              <NodeIcon node={ node } selected={ isSelected } />
              <span className={ classes.contentNameValue } onClick={(e) => { onClickNode(node); e.stopPropagation()} }>{node.name}</span>
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

  const header = (
    <>
      { showCheckboxes ?
        <div className={classes.contentCheck}>
          <Checkbox checked={selectedContent.type === 'ALL'} indeterminate={selectedContent.type === 'SOME'} onClick={() => onToggleAllNodesSelection()} />
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
        elements={content || []}
        elementsSize={contentSize || 0}
        rowHeight={45}
        header={header}
        renderRow={renderElementRow}
        renderLoadingRow={renderLoadingRow}
        elementKey={(node) => node.id}
        onLoadMoreElements={() => loadMoreContent()}
        loading={loadingContent}
      />
    )
  } else
    return null

}


export default withStyles(styles)(FilesListTable)
