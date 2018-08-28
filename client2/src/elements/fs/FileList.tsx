import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Slide from '@material-ui/core/Slide'
import Grow from '@material-ui/core/Grow'
import Fade from '@material-ui/core/Fade'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dropzone from 'react-dropzone'
import uuid = require('uuid/v4')

import { togglePopup } from '../../actions/popup/popupActions'
import Routes from '../../services/routes'
import { withStore } from '../../index'
import BreadCrumb from '../../elements/fs/BreadCrumb'
import { Directory, FsNode } from '../../models/FsNode'
import { ApiError } from '../../models/ApiError'
import { EnrichedFile } from '../../models/EnrichedFile'
import FileListTable from './FileListTable'


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
    const { loading, currentDirectory, initialPath } = this.props

    // Needs to update if not during a loading, and if the two path have changed (in that case the 'real' path wins)
    // This will likely occure during the first loading, or if the user use the browser history to navigate
    const needToUpdatePath =
      !loading && (currentDirectory ? initialPath !== currentDirectory.path : true)

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
              loading || (contentLoading && content.length === 0) ?
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
                    <FileListTable />
                  }
                </div>
              </Slide>
            }
          </div>
        </Dropzone>
      </main>
    )

  }

}
 
const FileListWithStyle = withStyles(styles) <PropsWithStyle> (FilesList)

const AFileListWithContext = () => (
  withStore(ctx => {
    const state = ctx.state
    const router = state.router
    
    return (
      <FileListWithStyle
        initialPath={router.location.pathname.substring(7)}
        currentDirectory={state.fs.current}
        currentDirectoryContent={state.fs.content}
        loading={state.fs.loadingCurrent}
        contentLoading={state.fs.loadingContent}
        error={state.fs.error}
        onChangePath={(path: string) => {
          router.push(`${Routes.app.fs}${path}${router.location.search}`)
          ctx.actions.getDirectory(path)
        }}
        onLoadDirectory={(path: string) => {
          ctx.actions.getDirectory(path)
        }}
        onFileUpload={(files: EnrichedFile[]) => {
          ctx.actions.selectUploadFile(files)
          togglePopup('FILE_UPLOAD', true)(ctx.state.router)
        }}
      />
    )
  })
)

export default AFileListWithContext
