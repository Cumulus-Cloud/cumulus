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

import FileListElement from '../../elements/fs/FileListElement'
import BreadCrumb from '../../elements/fs/BreadCrumb'
import { Directory } from '../../models/FsNode'
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
  onChangePath: (path: string, contentOffset: number) => void
  onFileUpload: (files: EnrichedFile[]) => void
  initialPath: string
  currentDirectory?: Directory
  error?: ApiError
  loading: boolean
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  dropzoneActive: boolean
}

class FilesList extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { dropzoneActive: false }
  }

  componentDidMount() {
    this.props.onChangePath(this.props.initialPath, 0) // TODO handle pagination
  }

  onChangePath(path: string) {
    this.props.onChangePath(path, 0) // TODO handle pagination
  }
  
  droppedFiles(files: File[]) {
    const enrichedFiles = files.map((file, i) => {
      return {
        id: i,
        filename: file.name,
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

  render() {
    const { currentDirectory, loading, classes } = this.props
    const { dropzoneActive } = this.state

    const breadCrumb = currentDirectory && currentDirectory.path !== '/' ? // Do not show for an empty path (root directory)
      <BreadCrumb path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <span/>

    const fileList = currentDirectory && !loading ?
      currentDirectory.content.map((node) => (
        <FileListElement
          key={node.id}
          fsNode={node}
          selected={false}
          onSelected={() => console.log('select')}
          onDeselected={() => console.log('select')}
          onClicked={() => this.onChangePath(node.path)}
        />
      )) :
      []

    // TODO show errors

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
                    fileList
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
