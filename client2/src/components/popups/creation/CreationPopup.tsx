import  React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import { connect, withStore } from 'store/store'
import { createDirectory } from 'store/actions/directoryCreation'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'
import ButtonLoader from 'components/utils/ButtonLoader'

import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

import styles from './styles'


const popupType: FsPopupType = 'DIRECTORY_CREATION'

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
  
    // TODO show error

    return (
      <Dialog
        fullScreen={ fullScreen }
        open={ open }
        onClose={ () => this.onClose() }
      >
        <form onSubmit={ (e) => this.onCreateDirectory(e) } className={ classes.root } >
          <DialogTitle id="responsive-dialog-title">
            Créer un nouveau dossier
          </DialogTitle>
          <DialogContent className={ classes.content } >
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nom dossier"
              type="text"
              disabled={loading}
              fullWidth
              onChange={ (e) => this.onDirectoryNameChange(e.target.value) }
              error={ !!error }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => this.onClose() } disabled={ loading } >
              Annuler
            </Button>
            <ButtonLoader loading={ loading } color="primary" type="submit" >
              Créer le dossier
            </ButtonLoader>
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
      loading: state.directoryCreation.loading,
      error: state.directoryCreation.error,
      onClose: () => {
        dispatch(hidePopup())
      },
      onCreateDirectory: (path: string) => {
        dispatch(createDirectory(path)).then((state) => {
          if(!state.directoryCreation.error)
            dispatch(hidePopup())
        })
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (CreationPopup)), mappedProps)
