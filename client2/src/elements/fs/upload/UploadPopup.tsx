import * as React from 'react'
import { Theme, Direction } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import CircularProgress from '@material-ui/core/CircularProgress'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import FileIcon from '@material-ui/icons/InsertDriveFile'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import CompressionIcon from '@material-ui/icons/UnfoldLess';
import NoCompressionIcon from '@material-ui/icons/MoreHoriz';
import RemoveIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Slide from '@material-ui/core/Slide';

import { ApiError } from '../../../models/ApiError'
import { Directory } from '../../../models/FsNode'


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
  onCreateDirectory: (name: string) => void
  open: boolean
  loading: boolean
  fullScreen: boolean
  current?: Directory
  error?: ApiError
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface EnrichedFile {
  id: number
  file: File
  filename: string
  compressed: boolean
  crypted: boolean
}

interface State {
  files: EnrichedFile[]
}


class UploadPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { files: [] }
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory() {
    // TODO check the provided string for forbidden char
 
  }

  onFilenameChange(updatedFile: EnrichedFile, filename: string) {
    const updatedFiles = this.state.files.map((file) => {
      if(file.id === updatedFile.id)
        return { ...file, filename }
      else
        return file
    })

    this.setState({ files: updatedFiles })
  }

  onCipherChange(updatedFile: EnrichedFile, crypted: boolean) {
    const updatedFiles = this.state.files.map((file) => {
      if(file.id === updatedFile.id)
        return { ...file, crypted }
      else
        return file
    })

    this.setState({ files: updatedFiles })
  }

  onCompressionChange(updatedFile: EnrichedFile, compressed: boolean) {
    const updatedFiles = this.state.files.map((file) => {
      if(file.id === updatedFile.id)
        return { ...file, compressed }
      else
        return file
    })

    this.setState({ files: updatedFiles })
  }

  onFilesChange(fileList: FileList | null) {
    if(fileList !== null) {
      let files = []
      for(let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        files.push({
          id: i,
          filename: file.name,
          compressed: false,
          crypted: true,
          file
        })
      }

      this.setState({ files })
    }
  }

  onDeleteFile(removedFile: EnrichedFile) {
    const updatedFiles = this.state.files.filter((file) => (file.id !== removedFile.id))

    this.setState({ files: updatedFiles })
  }

  render() {
    const { classes, fullScreen, open, error, loading } = this.props
    const { files } = this.state

    const fileList = files.map((file) => {

      const iconCompression =
        file.compressed ?
          [
            <CompressionIcon className={classes.fileIcon} />,
            <span>Compressé</span>
          ] :
          [
            <NoCompressionIcon className={classes.fileIcon} />,
            <span>Non compressé</span>
          ] 
        
        const iconCypher =
          file.crypted ?
            [
              <LockIcon className={classes.fileIcon} />,
              <span>Chiffré</span>
            ] :
            [
              <LockOpenIcon className={classes.fileIcon} />,
              <span>Non chiffré</span>
            ] 

      return (
        <ExpansionPanel elevation={0} >
          <ExpansionPanelSummary className={classes.fileHeader} expandIcon={<ExpandMoreIcon />}>
            <div className={classes.fileName}>
              <Typography  >{file.filename}</Typography>
              <Typography className={classes.fileIcons} variant="caption" >
                {iconCypher}
                {iconCompression}
              </Typography>
            </div>
     
            <IconButton className={classes.fileDeleteIcon}  onClick={() => this.onDeleteFile(file)} >
              <RemoveIcon/>
            </IconButton>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={file.crypted}
                    color="primary"
                    onChange={(e) => this.onCipherChange(file, e.target.checked)}
                  />
                }
                label="Chiffrer"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={file.compressed}
                    color="primary"
                    onChange={(e) => this.onCompressionChange(file, e.target.checked)}
                  />
                }
                label="Compresser"
              />
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Nom du fichier"
                type="text"
                value={file.filename}
                fullWidth
                onChange={(e) => this.onFilenameChange(file, e.target.value)}
              />
            </FormGroup>
          </ExpansionPanelDetails>
        </ExpansionPanel>
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
              <Slide direction="up" in={true} mountOnEnter unmountOnExit>
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
            onChange={(e) => this.onFilesChange(e.target.files) }
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
            <Button onClick={() => this.onCreateDirectory()} disabled={files.length === 0 || loading} color="primary" autoFocus>
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
