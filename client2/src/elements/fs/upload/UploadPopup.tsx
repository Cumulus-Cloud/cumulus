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

import { ApiError } from '../../../models/ApiError'
import { Directory } from '../../../models/FsNode'


const styles = (_: Theme) => createStyles({
  root: {
    minWidth: 450
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

interface State {
  fileName: string
}


class UploadPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { fileName: '' }
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory() {
    // TODO check the provided string for forbidden char
    const basePath = this.props.current ? this.props.current.path : '/'
    this.props.onCreateDirectory(`${basePath}/${this.state.fileName}`)
  }

  onFileNameChange(fileName: string) {
    this.setState({ fileName })
  }

  onFilesChange(files: FileList | null) {
    if(files !== null) {
      for(let i = 0; i < files.length; i++) {
        console.log(files[i])
      }
    }
  }

  render() {
    const { classes, fullScreen, open, error, loading } = this.props
  
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
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nom du fichier"
              type="text"
              disabled={true}
              fullWidth
              onChange={(e) => this.onFileNameChange(e.target.value)}
              error={!!error}
            />
          </DialogContent>
          <DialogContent>
            <input type="file" onChange={(e) => this.onFilesChange(e.target.files) } />
          </DialogContent>
          <DialogContentText>
            
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => this.onClose()} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={() => this.onCreateDirectory()} disabled={loading} color="primary" autoFocus>
              Envoyer le fichier selectionné
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ({ breakpoint: 'xs' })(UploadPopup))
