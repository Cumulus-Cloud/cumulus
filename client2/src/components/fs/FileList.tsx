import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'
import Button from '@material-ui/core/Button'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Slide from '@material-ui/core/Slide'
import Fade from '@material-ui/core/Fade'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dropzone from 'react-dropzone'
import uuid = require('uuid/v4')

import { Directory, FsNode } from 'models/FsNode'
import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'

import FileListTable from 'components/fs/FileListTable'
import BreadCrumb from 'components/fs/BreadCrumb'

import { connect, withStore } from 'store/store'
import { getDirectory, selectUploadFile } from 'store/actions'

import { togglePopup } from 'utils/popup'

import Routes from 'services/routes'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchIcon from '@material-ui/icons/Search'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
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
  header: {
    display: 'flex'
  },
  breadCrumb: {
    flex: 1,
    width: 100,
    overflow: 'auto'
  },
  contentWrapper: {
    width: '100%',
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    flex: 1
  },
  errorContent: {
    flex: 1,
    alignContent: 'center'
  },
  errorButton: {
    display: 'flex',
    margin: 'auto',
    textDecoration: 'none'
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
  onChangePath: (path: string) => void
  /** Called when the current directory should be loaded from the api. */
  onLoadDirectory: (path: string) => void
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
    const { loading, currentDirectory, initialPath, error } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occure during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !error && !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

    if(needToUpdatePath)
      this.props.onLoadDirectory(initialPath)
  }

  private onChangePath(path: string) {
    this.props.onChangePath(path)
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
    const { initialPath, currentDirectory, currentDirectoryContent, loading, contentLoading, classes, error } = this.props
    const { dropzoneActive } = this.state

    const files = currentDirectoryContent ? currentDirectoryContent : []
    const showLoading = loading || (contentLoading && files.length === 0)

    const dropZone = dropzoneActive &&
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

    const loader = showLoading &&
      <div className={classes.content} >
        <CircularProgress className={classes.loader} size={100} color="primary"/>
      </div> 

    const breadCrumb = currentDirectory ?
      <BreadCrumb className={classes.breadCrumb} path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <div style={{ flex: 1 }} />

    const displayedError = !showLoading && error &&
      <Slide direction="up" in={true}>
        <div className={classes.errorContent} >
          <Typography variant="caption" className={classes.emptyDirectory}> 
            <WarningIcon className={classes.emptyDirectoryIcon}/>
            {`Une erreur est survenue au chargement de ${initialPath} : ${error.message}`}
          </Typography>
          {
            error.key === 'api-error.not-found' && 
            <Button variant="outlined" color="primary" className={classes.errorButton} onClick={() => this.onChangePath('/')} >Go back to the root directory</Button>
          }
        </div>
      </Slide>

    const content = !showLoading && !error &&
      <Slide direction="up" in={true}>
        <div className={classes.content} >
          {
            files.length == 0 ?
            <Typography variant="caption" className={classes.emptyDirectory} >
              <InfoIcon className={classes.emptyDirectoryIcon}/>
              {'Ce dossier est vide'} 
            </Typography> :
            <FileListTable />
          }
        </div>
      </Slide>

    return (
      <main className={classes.root} >
        <Dropzone
          disableClick  
          className={classes.dropzoneWrapper}
          onDrop={(files) => this.droppedFiles(files)}
          onDragEnter={() => this.onDragEnter()}
          onDragLeave={() => this.onDragLeave()}
        >
          {dropZone}
          <div className={classes.header} >
          {breadCrumb}
            <TextField
              placeholder="Search a file or a directory"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className={classes.contentWrapper} >
            {loader}
            {displayedError}
            {content}
          </div>
        </Dropzone>
      </main>
    )

  }

}
 

const mappedProps =
  connect(({ fs, router }, dispatch) => ({
    initialPath: router.location.pathname.substring(7),
    currentDirectory: fs.current,
    currentDirectoryContent: fs.content,
    loading: fs.loadingCurrent,
    contentLoading: fs.loadingContent,
    error: fs.error,
    onChangePath: (path: string) => {
      router.push(`${Routes.app.fs}${path}${router.location.search}`)
      dispatch(getDirectory(path))
    },
    onLoadDirectory: (path: string) => {
      dispatch(getDirectory(path))
    },
    onFileUpload: (files: EnrichedFile[]) => {
      dispatch(selectUploadFile(files))
      togglePopup('FILE_UPLOAD', true)(router)
    }
  }))

export default withStore(withStyles(styles) <PropsWithStyle> (FilesList), mappedProps)
