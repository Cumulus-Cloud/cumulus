import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import { distanceInWords } from 'date-fns'
import Waypoint from 'react-waypoint'
import classnames from 'classnames'

import { Directory, FsNode } from '../../models/FsNode'
import { Checkbox } from '@material-ui/core';


const styles = (theme: Theme) => createStyles({
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
    alignItems: 'center'
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
  contentTable: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderTop: 0
  },
  contentTableHead: {
    zIndex: 99,
    boxShadow: 'none',
    backgroundColor: 'white',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0,
    position: 'sticky',
    top: '-16px'
  }
})

interface Props {
  /** When details for a node are requested. */
  onShowNodeDetail: (node: FsNode) => void
  /** When a directory is selected, to change the viewer current directory. */
  onSelectedDirectory: (directory: Directory) => void
  /** When more content needs to be loaded. */
  onLoadMoreContent: (offset: number) => void
  /** If more content is loading. */
  loading: boolean
  /** If there is more content to load. */
  hasMore: boolean
  /** Content of the loaded current directory. */
  content: FsNode[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  selected: string[],
  showCheckboxes: boolean
}

class FilesListTable extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)

    this.state = { selected: [], showCheckboxes: false }
  }

  onSelectedDirectory(directory: Directory) {
    this.props.onSelectedDirectory(directory)
  }

  onShowNodeDetail(node: FsNode) {
    this.props.onShowNodeDetail(node)
  }

  onLoadMoreContent() {
    this.props.onLoadMoreContent(this.props.content.length)
  }

  onSelectNode(node: FsNode) {
    if(this.state.selected.indexOf(node.id) < 0)
      this.setState({ ...this.state, selected: this.state.selected.concat([ node.id ]), showCheckboxes: true })
  }

  onSelectAllNode() {
    this.setState({ ...this.state, selected: this.props.content.map((node) => node.id), showCheckboxes: true })
  }

  onDeselectNode(node: FsNode) {
    this.setState({ ...this.state, selected: this.state.selected.filter((id) => id != node.id) })
  }

  onDeselectAllNode() {
    this.setState({ ...this.state, selected: [] })
  }

  render() {
    const { content, loading, classes } = this.props
    const { selected, showCheckboxes } = this.state

    const now = new Date()

    const fileList =
      content.map((node) => {
        const isSelected = selected.indexOf(node.id) >= 0

        const checkbox =
          showCheckboxes ? (
            isSelected ?
              <Checkbox key={node.id + '_checked'} className={classes.contentCheck} checked={true} defaultChecked={true} onClick={() => this.onDeselectNode(node) } /> :
              <Checkbox key={node.id + '_not-checked'} className={classes.contentCheck} onClick={() => this.onSelectNode(node) } />
          ) : <span/>

        const icon =
          node.nodeType === 'DIRECTORY' ?
            <DirectoryIcon /> :
            <FileIcon />

        return (
          <div
            className={classnames(classes.contentRow, { [classes.contentRowSelected]: isSelected})}
            key={node.id}
            onClick={() => {
              if(!isSelected)
                this.onSelectNode(node)
              else
              this.onDeselectNode(node)
            }}
          >
            <div className={classes.contentCheck}>{checkbox}</div>
            <Typography variant="body1" className={classnames(classes.contentName, { [classes.contentSelected]: isSelected })}>
              <span className={classnames(classes.contentTypeIcon, { [classes.contentSelected]: isSelected })} >{icon}</span>
              <span
                className={classes.contentNameValue} 
                onClick={() => {
                  if(node.nodeType === 'DIRECTORY')
                    this.onSelectedDirectory(node)
                  else
                    this.onShowNodeDetail(node)
                }}
              >
                {node.name}
              </span>
            </Typography>
            <Typography variant="body1" className={classes.contentModification} >{distanceInWords(new Date(node.modification), now)}</Typography>
            <Typography variant="body1" className={classes.contentSize} >{node.nodeType === 'DIRECTORY' ? '-' : node.humanReadableSize}</Typography>
          </div>
        )
      })

    // TODO show errors ?

    return (
      <Paper className={classes.contentTable} >
        <div>
          <div className={classes.contentTableHead}>
            <div className={classes.contentHeadRow} >
              { showCheckboxes ?
                <div className={classes.contentCheck}>
                  <Checkbox indeterminate onClick={() => this.onSelectAllNode()} />
                </div> :
                <span/>
              }
              <Typography variant="caption" className={classes.contentName} >Nom</Typography>
              <Typography variant="caption" className={classes.contentModification}>Modification</Typography>
              <Typography variant="caption" className={classes.contentSize}>Taille</Typography>
            </div>
          </div>
          <div>
            {fileList.concat([ <Waypoint key="waypoint" onEnter={() => !loading ? this.onLoadMoreContent() : undefined } /> ])}
          </div>
        </div>
      </Paper>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (FilesListTable)
