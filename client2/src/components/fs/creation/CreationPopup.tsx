import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import CircularProgress from '@material-ui/core/CircularProgress'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import { connect, withStore } from 'store/store'
import { createDirectory } from 'store/actions/directoryCreation'
import { hidePopup } from 'store/actions/popups'
import { PopupType } from 'store/states/popupsState'

import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'


const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: 450,
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      height: '100%',
      display: 'flex'
    }
  },
  content: {
    flex: 1
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
})

const popupType: PopupType = 'DIRECTORY_CREATION'

interface Props {
  onClose: () => void
  onCreateDirectory: (name: string) => void
  open: boolean
  fullScreen?: boolean
  loading: boolean
  current?: Directory
  error?: ApiError
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  directoryName: string
}


class CreationPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { directoryName: '' }
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory(e: React.FormEvent) {
    e.preventDefault()
    // TODO check the provided string for forbidden char
    const basePath = this.props.current ? this.props.current.path : '/'
    this.props.onCreateDirectory(`${basePath}/${this.state.directoryName}`)
  }

  onDirectoryNameChange(directoryName: string) {
    this.setState({ directoryName })
  }

  render() {
    const { classes, fullScreen, open, error, loading } = this.props
  
    return (
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={() => this.onClose()}
      >
        <form onSubmit={(e) => this.onCreateDirectory(e)} className={classes.root} >
          <DialogTitle id="responsive-dialog-title">
            Créer un nouveau dossier
          </DialogTitle>
          <DialogContent className={classes.content} >
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nom dossier"
              type="text"
              disabled={loading}
              fullWidth
              onChange={(e) => this.onDirectoryNameChange(e.target.value)}
              error={!!error}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.onClose()} disabled={loading}>
              Annuler
            </Button>
            <Button disabled={loading} color="primary" type="submit" >
              Créer le dossier
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    )
  }

}


const mappedProps =
  connect((state, dispatch) => {
    return {
      open: state.popups.open === popupType,
      current: state.fs.current,
      loading: state.createDirectory.loading,
      error: state.createDirectory.error,
      onClose: () => {
        dispatch(hidePopup())
      },
      onCreateDirectory: (path: string) => {
        dispatch(createDirectory(path)).then((state) => {
          if(!state.createDirectory.error)
            dispatch(hidePopup())
        })
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (CreationPopup)), mappedProps)
