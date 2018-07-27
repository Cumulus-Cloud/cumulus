import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import CircularProgress from '@material-ui/core/CircularProgress'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Slide from '@material-ui/core/Slide'
import uuid = require('uuid/v4')

import { ApiError } from '../../../models/ApiError'
import { Directory } from '../../../models/FsNode'
import UploadFile from './UploadFile'
import { EnrichedFile } from '../../../models/EnrichedFile'


const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: 450
  },
  fileHeader: {
    display: 'flex'
  },
  input: {
    display: 'none'
  },
  fileName: {
    flex: 1
  },
  fileIcons: {
    paddingTop: 5,
    marginLeft: -6,
    display: 'flex'
  },
  fileIcon : {
    height: 15
  },
  fileDeleteIcon: {
    marginRight: 32,
    paddingRight: '0 !important' // Block default padding
  },
  fileButton: {
    width: '90%',
    margin: 'auto',

    display: 'block',
    textAlign: 'center'
  },
  button: {
    margin: theme.spacing.unit
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
})

interface Props {
  onClose: () => void
  onFilesSelected: (files: EnrichedFile[]) => void
  onDeleteFile: (file: EnrichedFile) => void
  onUpdateFile: (file: EnrichedFile) => void
  onUploadFiles: () => void
  open: boolean
  loading: boolean
  fullScreen: boolean
  files: EnrichedFile[]
  current?: Directory
  error?: ApiError
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}

class UploadPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { files: [] }
  }

  onClose() {
    this.props.onClose()
  }

  onUploadFiles() {
    // TODO check the provided string for forbidden char
    console.log('Starting the file upload')
    this.props.onUploadFiles()
  }

  onUpdateFile(updatedFile: EnrichedFile) {
    this.props.onUpdateFile(updatedFile)
  }

  onFileSelected(fileList: FileList | null) {
    const { current } = this.props

    if(fileList !== null) {
      let files = []
      for(let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        files.push({
          id: uuid(),
          filename: file.name,
          location: current ? current.path : '/',
          compressed: false,
          crypted: true,
          file
        })
      }

      this.props.onFilesSelected(files)
    }
  }

  onDeleteFile(removedFile: EnrichedFile) {
    this.props.onDeleteFile(removedFile)
  }

  render() {
    const { classes, files, fullScreen, open, error, loading } = this.props

    const fileList = files.map((file, i) => {
      return (
        <UploadFile
          key={i}
          file={file}
          onDelete={() => this.onDeleteFile(file)}
          onUpdate={(updated) => this.onUpdateFile(updated)}
        />
      )
    })
  
    return (
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={() => this.onClose()}
        aria-labelledby="responsive-dialog-title"
      >
        <div  className={classes.root} >
          <DialogTitle id="responsive-dialog-title">
            Mettre en ligne un nouveau fichier
          </DialogTitle>
          <DialogContent>
            {
              files.length === 0 ?
              <span/> :
              <Slide direction="up" in={true}>
                <div className={classes.root}>
                  {fileList}
                </div>
              </Slide>
            }
          </DialogContent>
          <DialogContent>
            <input
              className={classes.input}
              id="raised-button-file"
              multiple
              type="file"
              onChange={(e) => this.onFileSelected(e.target.files) }
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" color="primary" component="span" className={classes.fileButton}>
                Selectionner des fichiers
              </Button>
            </label>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.onClose()} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={() => this.onUploadFiles()} disabled={files.length === 0 || loading} color="primary" autoFocus>
              {files.length > 0 ? "Envoyer les fichiers selectionnés" : "Envoyer le fichier selectionné"}
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ({ breakpoint: 'xs' })(UploadPopup))
