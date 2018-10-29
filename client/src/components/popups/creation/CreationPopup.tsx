import  React from 'react'
import TextField from '@material-ui/core/TextField'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import { connect, withStore } from 'store/store'
import { createDirectory } from 'store/actions/directoryCreation'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'

import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

import Popup from 'components/utils/Popup'


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

interface State {
  directoryName: string
}


class CreationPopup extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { directoryName: '' }
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory() {
    const basePath = this.props.current ? this.props.current.path : '/'
    this.props.onCreateDirectory(`${basePath}/${this.state.directoryName}`)
  }

  onDirectoryNameChange(directoryName: string) {
    this.setState({ directoryName })
  }

  render() {
    const { open, error, loading } = this.props

    return (
      <Popup
        title="Créer un nouveau dossier"
        action="Créer le dossier"
        cancel="Annuler"
        error={ error && error.errors['path'] && error.errors['path'][0] }
        loading={ loading }
        open={ open }
        onClose={ () => this.onClose() }
        onValidate={ () => this.onCreateDirectory() }
      >
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
      </Popup>
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

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(CreationPopup), mappedProps)
