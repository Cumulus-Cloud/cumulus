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

import BreadCrumb from '../../elements/fs/BreadCrumb'
import { Directory, FsNode } from '../../models/FsNode'
import { ApiError } from '../../models/ApiError'
import { EnrichedFile } from '../../models/EnrichedFile'
import FileListTableContainer from './FileListTableContainer'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 3,
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      marginTop: 64,
    },
    minWidth: 0,
    display: 'flex'
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
  dropzoneWrapper: {
    position: 'relative',
    display: 'flex', 
    flex: 1,
    flexDirection: 'column'
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
  loaderContent: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 800,
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    flex: 1
  },
  content: {
    display: 'flex',
    flex: 1
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  emptyDirectory: {
    display: 'flex',
    flex: 1,
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDirectoryIcon: {
    marginRight: theme.spacing.unit
  }
})

interface Props {
  /** Called when the path should be updated, meaning when the path was changed within the app. */
  onChangePath: (path: string, contentOffset: number) => void
  /** Called when the current directory should be loaded from the api. */
  onLoadDirectory: (path: string, contentOffset: number) => void
  /** List of files selected for the upload */
  onFileUpload: (files: EnrichedFile[]) => void
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

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  /** If the user is hovering the dropzone */
  dropzoneActive: boolean
}

class FilesList extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { dropzoneActive: false }
    this.checkIfPathNeedsRefresh()
  }

  componentDidUpdate() {
    this.checkIfPathNeedsRefresh()
  }

  private checkIfPathNeedsRefresh() {
    const { loading, currentDirectory, initialPath } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occure during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

    if(needToUpdatePath)
      this.props.onLoadDirectory(initialPath, 0) // TODO handle pagination
  }

  private onChangePath(path: string) {
    this.props.onChangePath(path, 0) // TODO handle pagination
  }
  
  private droppedFiles(files: File[]) {
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

  private onDragEnter() {
    this.setState({ dropzoneActive: true })
  }

  private onDragLeave() {
    this.setState({ dropzoneActive: false })
  }

  render() {
    const { currentDirectory, currentDirectoryContent, loading, contentLoading, classes } = this.props
    const { dropzoneActive } = this.state

    const breadCrumb = currentDirectory && currentDirectory.path !== '/' ? // Do not show for an empty path (root directory)
      <BreadCrumb path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <span/>

    const now = new Date()
    const content = currentDirectoryContent ? currentDirectoryContent : []

    // TODO show errors

    return (
      <main className={classes.root} >
        <Dropzone
          disableClick  
          className={classes.dropzoneWrapper}
          onDrop={(files) => this.droppedFiles(files)}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
        >
        { dropzoneActive &&
          <Fade in={true} >
            <div className={classes.dropzone} >
              <div className={classes.dropzoneInner} >
                <CloudIcon className={classes.dropzoneIcon} />
                <Typography variant="display1" className={classes.dropzoneText} >
                  Lâcher pour ajouter au dossier courant
                </Typography>
              </div>
            </div>
          </Fade>
        }
          {breadCrumb}
          <div className={classes.contentWrapper} >
            {
              loading ?
              <div className={classes.content} >
                <CircularProgress className={classes.loader} size={100} color="primary"/>
              </div> :
              <Slide direction="up" in={true}>
                <div className={classes.content} >
                  {
                    content.length == 0 ?
                    <Typography variant="caption" className={classes.emptyDirectory} >
                      <InfoIcon className={classes.emptyDirectoryIcon}/>
                      {'Ce dossier est vide'} 
                    </Typography> :
                    <FileListTableContainer />
                  }
                </div>
              </Slide>
            }
          </div>
        </Dropzone>
      </main>
    )

    /*
      TODO content loader for previous infinite scroll

      { // Note: outside of the <Slide/> to avoid breaking the sticky header with the loading animation
        contentLoading ?
        <div>
          <div>
            <CircularProgress className={classes.loaderContent} size={20} color="primary"/>
          </div>
          <Typography variant="caption" className={classes.emptyDirectory} >
            {'Chargement de plus de contenu..'} 
          </Typography>
        </div>
        : <span/>
      }

    */

  }

}

export default withStyles(styles) <PropsWithStyle> (FilesList)
