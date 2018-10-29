import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Slide from '@material-ui/core/Slide'
import uuid = require('uuid/v4')

import { connect, withStore } from 'store/store'
import { selectUploadFile, deleteUploadFile, updateUploadFile, uploadAllFiles } from 'store/actions/fileUpload'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'

import { Directory } from 'models/FsNode'
import { EnrichedFile } from 'models/EnrichedFile'

import Popup from 'components/utils/Popup'

import UploadFile from './UploadFile'


const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: 450,
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      height: 'none',
      display: 'flex',
      minWidth: 'inherit'
    }
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('xs')]: {
      maxHeight: '400px' // Avoid having a too high popup
    },
    [theme.breakpoints.down('xs')]: {
      maxHeight: 'unset' // Not needed when fullscreen
    }
  },
  fileHeader: {
    display: 'flex'
  },
  input: {
    display: 'none'
  },
  inputContainer: {
    flex: 'unset',
    minHeight: '40px',
    padding: '20px'
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
    marginTop: '25px',
    display: 'block',
    textAlign: 'center'
  }
})


const popupType: FsPopupType = 'FILE_UPLOAD'

interface Props {
  onClose: () => void
  onFilesSelected: (files: EnrichedFile[]) => void
  onDeleteFile: (file: EnrichedFile) => void
  onUpdateFile: (file: EnrichedFile) => void
  onUploadFiles: () => void
  open: boolean
  fullScreen?: boolean
  files: EnrichedFile[]
  current?: Directory
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
    const { classes, files, open } = this.props

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
      <Popup
        title="Mettre en ligne de nouveaux fichiers"
        action={files.length > 0 ? "Envoyer les fichiers selectionnés" : "Envoyer le fichier selectionné"}
        cancel="Annuler"
        loading={ false }
        disabled={ files.length === 0 }
        open={ open }
        onClose={ () => this.onClose() }
        onValidate={ () => this.onUploadFiles() }
      >
        <div className={classes.content} >
          {
            files.length === 0 ?
            <span/> :
            <Slide direction="up" in={true}>
              <div className={classes.root}>
                {fileList}
              </div>
            </Slide>
          }
        </div>
        <div className={classes.inputContainer} >
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
        </div>
      </Popup>
    )
  }

}


const mappedProps =
  connect((state, dispatch) => {
    return {
      open: state.popups.open === popupType,
      current: state.fs.current,
      files: state.fileUpload.files,
      onFilesSelected: (files: EnrichedFile[]) => {
        dispatch(selectUploadFile(files))
      },
      onDeleteFile: (deletedFile: EnrichedFile) => {
        dispatch(deleteUploadFile(deletedFile))
      },
      onUpdateFile: (updatedFile: EnrichedFile) => {
        dispatch(updateUploadFile(updatedFile))
      },
      onClose: () => {
        dispatch(hidePopup())
      },
      onUploadFiles: () => {
        dispatch(hidePopup())
        dispatch(uploadAllFiles())
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (UploadPopup)), mappedProps)
