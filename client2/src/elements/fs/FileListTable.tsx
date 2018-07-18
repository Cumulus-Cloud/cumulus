import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper';
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import { distanceInWords } from 'date-fns'
import Waypoint from 'react-waypoint'

import { Directory, FsNode } from '../../models/FsNode'


const styles = (theme: Theme) => createStyles({
  contentTypeIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing.unit * 2
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
  contentTable: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderTop: 0
  },
  contentTableHead: {
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

class FilesListTable extends React.Component<PropsWithStyle, {}> {

  constructor(props: PropsWithStyle) {
    super(props)
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

  render() {
    const { content, loading, classes } = this.props

    const now = new Date()

    const fileList =
      content.map((node) => {
        if(node.nodeType === 'DIRECTORY')
          return (
            <div className={classes.contentRow} key={node.id}>
              <Typography variant="body1" className={classes.contentName} onClick={() => this.onSelectedDirectory(node)}>
                <span className={classes.contentTypeIcon} ><DirectoryIcon /></span>
                <span className={classes.contentNameValue} >{node.name}</span>
              </Typography>
              <Typography variant="body1" className={classes.contentModification} >{distanceInWords(new Date(node.modification), now)}</Typography>
              <Typography variant="body1" className={classes.contentSize} >{'-'}</Typography>
            </div>
          )
        else
          return (
            <div className={classes.contentRow} key={node.id}>
              <Typography variant="body1" className={classes.contentName} onClick={() => this.onShowNodeDetail(node)}>
                <span className={classes.contentTypeIcon} ><FileIcon /></span>
                <span className={classes.contentNameValue} >{node.name}</span>
              </Typography>
              <Typography variant="body1" className={classes.contentModification} >{distanceInWords(new Date(node.modification), now)}</Typography>
              <Typography variant="body1" className={classes.contentSize} >{node.humanReadableSize}</Typography>
            </div>
          )
      })

    // TODO show errors ?

    return (
      <Paper className={classes.contentTable} >
        <div>
          <div className={classes.contentTableHead}>
            <div className={classes.contentHeadRow} >
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
