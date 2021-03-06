import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'
import uuid = require('uuid/v4')

import { FsPopupType } from 'store/states/popupsState'
import { useFilesystem, useFileUpload, usePopups } from 'store/store'

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


type PropsWithStyle = WithStyles<typeof styles>


function UploadPopup({ classes }: PropsWithStyle) {

  const { isPopupOpen, hidePopup } = usePopups()
  const { current } = useFilesystem()
  const {
    files,
    selectUploadFile,
    deleteUploadFile,
    updateUploadFile,
    uploadAllFiles
  } = useFileUpload()

  function selectFiles(fileList: FileList | null) {
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

      selectUploadFile(files)
    }
  }

  const fileList = files.map((file, i) => {
    return (
      <UploadFile
        key={i}
        file={file}
        onDelete={() => deleteUploadFile(file)}
        onUpdate={(updated) => updateUploadFile(updated)}
      />
    )
  })

  return (
    <Popup
      title="Mettre en ligne de nouveaux fichiers"
      action={files.length > 0 ? "Envoyer les fichiers selectionnés" : "Envoyer le fichier selectionné"}
      cancel="Annuler"
      loading={false}
      disabled={files.length === 0}
      open={isPopupOpen(popupType)}
      onClose={hidePopup}
      onValidate={uploadAllFiles}
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
          onChange={(e) => selectFiles(e.target.files) }
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

export default withStyles(styles)(UploadPopup)
