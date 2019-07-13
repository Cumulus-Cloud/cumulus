import  React from 'react'
import TextField from '@material-ui/core/TextField'

import { FsPopupType } from 'store/states/popupsState'
import { usePopups, useDirectoryCreation, useFilesystem } from 'store/store'

import Popup from 'components/utils/Popup'


const popupType: FsPopupType = 'DIRECTORY_CREATION'


function CreationPopup() {

  const [directoryName, setDirectoryName] = React.useState('')

  const { current } = useFilesystem()
  const { isPopupOpen, hidePopup } = usePopups()
  const { createDirectory, loading, error } = useDirectoryCreation()

  return (
    <Popup
      title="Créer un nouveau dossier"
      action="Créer le dossier"
      cancel="Annuler"
      error={error && error.errors && error.errors['path'] && error.errors['path'][0]}
      loading={loading }
      open={isPopupOpen(popupType)}
      onClose={hidePopup}
      onValidate={() => createDirectory(`${current ? current.path : ''}/${directoryName.trim()}`)}
    >
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label="Nom dossier"
        type="text"
        disabled={loading}
        fullWidth
        onChange={(e) => setDirectoryName(e.target.value)}
        error={!!error}
      />
    </Popup>
  )
}

export default CreationPopup
