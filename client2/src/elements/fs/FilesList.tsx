import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Slide from '@material-ui/core/Slide'
import Fade from '@material-ui/core/Fade'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dropzone from 'react-dropzone'
import uuid = require('uuid/v4')
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DirectoryIcon from '@material-ui/icons/Folder'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import { distanceInWords } from 'date-fns'

import FileListElement from '../../elements/fs/FileListElement'
import BreadCrumb from '../../elements/fs/BreadCrumb'
import { Directory, FsNode } from '../../models/FsNode'
import { ApiError } from '../../models/ApiError'
import { EnrichedFile } from '../../models/EnrichedFile';


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 4, // +1 for the scrollbar
    marginTop: theme.mixins.toolbar.minHeight,
    minWidth: 0,
    overflowY: 'scroll',
    ['&::-webkit-scrollbar']: {
      width: theme.spacing.unit
    },
    ['&::-webkit-scrollbar-track']: {
      background: theme.palette.background.paper
    },
    ['&::-webkit-scrollbar-thumb']: {
      background: '#CCC'
    },
    ['&::-webkit-scrollbar-thumb:hover']: {
      background: '#BBB'
    }
  },
  dropzone: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    color: '#fff',
    zIndex: 9999,
    display: 'flex'
  },
  dropzoneInner: {
    border: '5px lightgray dotted',
    margin: 11,
    borderRadius: 33,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneIcon: {
    width: 200,
    height: 200
  },
  dropzoneText: {
    color: 'white'
  },
  content: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    maxWidth: 800,
    marginRight: 'auto',
    marginLeft: 'auto'
  },
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
    textOverflow: 'ellipsis'
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
    height: '64px',
    alignItems: 'center'
  },
  contentRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    height: '45px',
    alignItems: 'center'
  },
  contentTableElement: {
    whiteSpace: 'nowrap'
  },
  contentTable: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderTop: 0
    //overflow: 'auto'
  },
  contentTableHead: {
    boxShadow: 'none',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0,
    position: 'sticky',
    top: 0
  },
  contentTableHead2: {
    boxShadow: 'none',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0,
  },
  contentTableHeadBack: {
    border: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: 'white',
    width: '100%',
    height: '60px',
    position: 'sticky',
    top: '16px',
    //marginTop: '-80px'
  },
  contentTableHeadBackground: {
    backgroundColor: '#fafafa',
    width: '100%',
    height: '80px',
    position: 'sticky',
    top: '-25px',
    marginTop: '-80px'
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  emptyDirectory: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDirectoryIcon: {
    marginRight: theme.spacing.unit
  }
})

interface Props {
  /** Called when the path should be updated, meaning when the path was changed within the app, or via the browser */
  onChangePath: (path: string, contentOffset: number) => void
  /** List of files selected for the upload */
  onFileUpload: (files: EnrichedFile[]) => void
  /** When more content needs to be loaded */
  onLoadMoreContent: (offset: number) => void
  /** Initial real path, comming from the browser path */
  initialPath: string
  /** Loaded current directory, from the store. */
  currentDirectory?: Directory
  /** Content of the loaded current directory, from the store. */
  currentDirectoryContent?: FsNode[]
  /** If the store is loading the data */
  loading: boolean
  /** If the store is loading more content */
  contentLoading: boolean
  /** Loading error */
  error?: ApiError
}

// TODO handle pagination :
// - add paginationLoading to load elements after the loader elements
// - add a spinner if the loading takes too much time
// - keep track of the pagination (what load next? is there more to load?)
// - move up the waypoint to start loading before the end (50 elements + a 2/3 ?)
// - how handle new elements and not lost scroll ?

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  /** If the user is hovering the dropzone */
  dropzoneActive: boolean
}

class FilesList extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { dropzoneActive: false }
  }

  componentDidUpdate() {
    const { loading, currentDirectory, initialPath } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occure during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

    if(needToUpdatePath)
      this.props.onChangePath(initialPath, 0) // TODO handle pagination
  }

  onChangePath(path: string) {
    this.props.onChangePath(path, 0) // TODO handle pagination
  }

  onLoadMoreContent() {
    this.props.onLoadMoreContent(0) // TODO
  }
  
  droppedFiles(files: File[]) {
    const { currentDirectory } = this.props 
    const enrichedFiles = files.map((file) => {
      return {
        id: uuid(),
        filename: file.name,
        location: currentDirectory ? currentDirectory.path : '/',
        compressed: false,
        crypted: true,
        file
      }
    }) 

    this.props.onFileUpload(enrichedFiles)
    this.setState({ dropzoneActive: false })
  }

  onDragEnter() {
    this.setState({ dropzoneActive: true })
  }

  onDragLeave() {
    this.setState({ dropzoneActive: false })
  }

  // TODO
  // - See if its possible to have y scroll with sticky element
  // - If not possible, maybe remake the table with divs and flex to handle the scrolling and the sticky headers
  // - Also, to have better control on elements sizing..
  // - If possible, then ok
  // - Add the breadcrumb to the sticky part, to allow scrolling with it

  render() {
    const { currentDirectory, currentDirectoryContent, loading, classes } = this.props
    const { dropzoneActive } = this.state

    const breadCrumb = currentDirectory && currentDirectory.path !== '/' ? // Do not show for an empty path (root directory)
      <BreadCrumb path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <span/>

    const now = new Date()

    const fileList = currentDirectoryContent && !loading ?
      currentDirectoryContent.map((node) => {
          
      const icon =
        node.nodeType === 'DIRECTORY' ?
          <DirectoryIcon /> :
          <FileIcon />

        return (
          <div className={classes.contentRow} key={node.id}>
            <Typography variant="body1" className={classes.contentName} onClick={() => node.nodeType === 'DIRECTORY' ? this.onChangePath(node.path) : undefined } >
              <span className={classes.contentTypeIcon} >{icon}</span>
              <span className={classes.contentNameValue} >{node.name}</span>
            </Typography>
            <Typography variant="body1" className={classes.contentModification} >{distanceInWords(new Date(node.modification), now)}</Typography>
            <Typography variant="body1" className={classes.contentSize} >{node.nodeType == 'FILE' ? node.humanReadableSize : '-'}</Typography>
          </div>
          /*
          <FileListElement
            key={node.id}
            fsNode={node}
            selected={false}
            onSelected={() => console.log('select')}
            onDeselected={() => console.log('select')}
            onClicked={() => this.onChangePath(node.path)}
          />
          */
        )
      }) :
      []

    // TODO show errors

    /*

      <Table>
        <TableHead >
          <TableRow >
            <TableCell className={classes.contentTableHead2} colSpan={2} >Nom</TableCell>
            <TableCell className={classes.contentTableHead2} >Modification</TableCell>
            <TableCell className={classes.contentTableHead2} >Taille</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fileList}
        </TableBody>
      </Table>
    */

    return (
      <main className={classes.root}>
      <Dropzone
        disableClick  
        style={{position: "relative"}}
        onDrop={(files) => this.droppedFiles(files)}
        onDragEnter={() => this.onDragEnter()}
        onDragLeave={() => this.onDragLeave()}
      >
      { dropzoneActive &&
        <Fade in={true} >
          <div className={classes.dropzone}>
            <div className={classes.dropzoneInner}>
              <CloudIcon className={classes.dropzoneIcon} />
              <Typography variant="display1" className={classes.dropzoneText} >
                Lâcher pour ajouter au dossier courant
              </Typography>
            </div>
          </div>
        </Fade>
      }
        <span>
          {breadCrumb}
          <div className={classes.content}>
            {
              loading ?
              <div>
                <CircularProgress className={classes.loader} size={100} color="primary"/>
              </div> :
              <Slide direction="up" in={true}>
                <div>
                  {
                    fileList.length == 0 ?
                    <Typography variant="caption" className={classes.emptyDirectory} >
                      <InfoIcon className={classes.emptyDirectoryIcon}/>
                      {'Ce dossier est vide'} 
                    </Typography> :
                    <div>
                      <Paper className={classes.contentTable} >
                        <div>
                          <div className={classes.contentTableHead2}>
                            <div className={classes.contentHeadRow} >
                              <Typography variant="caption" className={classes.contentName} >Nom</Typography>
                              <Typography variant="caption" className={classes.contentModification}>Modification</Typography>
                              <Typography variant="caption" className={classes.contentSize}>Taille</Typography>
                            </div>
                          </div>
                          <div>
                            {fileList}
                          </div>
                        </div>
                      </Paper>
                    </div>
                  }
                </div>
              </Slide>
            }
          </div>
        </span>
      </Dropzone>
      </main>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (FilesList)
