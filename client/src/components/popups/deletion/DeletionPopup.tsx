import  React from 'react'
import { Checkbox, DialogContentText, FormControlLabel } from '@material-ui/core'

import { FsPopupType } from 'store/states/popupsState'
import { usePopups, useNodeDeletion } from 'store/storeHooks'

import { FsNode, isFile, isDirectory } from 'models/FsNode'

import NoWrap from 'components/utils/NoWrap'
import Popup from 'components/utils/Popup'


const popupType: FsPopupType = 'NODE_DELETION'


function getMessage(nodes: FsNode[]) {
  const hasFile = !!nodes.find(node => isFile(node))
  const hasDirectory = !!nodes.find(node => isDirectory(node))

  // TODO i18n
  if (nodes.length == 1) {
    if (hasFile)
      return <>Êtes-vous certain de vouloir supprimer le fichier <NoWrap> { `« ${nodes[0].name} »` } </NoWrap> ?</>
    else
      return <>Êtes-vous certain de vouloir supprimer le dossier <NoWrap> { `« ${nodes[0].name} »` } </NoWrap> ?</>
  } else {
    if (hasFile && !hasDirectory)
      return `Êtes-vous certain de vouloir supprimer ces ${nodes.length} fichiers ?`
    else if (!hasFile && hasDirectory)
      return `Êtes-vous certain de vouloir supprimer ces ${nodes.length} dossiers ?`
    else
      return `Êtes-vous certain de vouloir supprimer ces ${nodes.length} éléments ?`
  }
}


function DeletionPopup() {

  const [deleteContent, setDeleteContent] = React.useState(false)

  const { isPopupOpen, hidePopup, target } = usePopups()
  const { deleteNodes, loading, error } = useNodeDeletion()

  const nodes = target || []
  const hasDirectory = !!nodes.find(node => isDirectory(node))

  return (
    <Popup
      title="Confirmation de suppression"
      action="Supprimer"
      cancel="Annuler"
      error={error}
      loading={loading}
      open={isPopupOpen(popupType)}
      onClose={hidePopup}
      onValidate={() => deleteNodes(nodes, deleteContent)}
    >
      <DialogContentText>
        { getMessage(nodes) }
      </DialogContentText>
      { hasDirectory &&
        <FormControlLabel
          disabled={ loading }
          control={<Checkbox checked={ deleteContent } color="primary" onChange={(e) => setDeleteContent(e.target.checked)} />}
          label={<DialogContentText>Également supprimer le contenu des dossiers ?</DialogContentText>}
        />
      }
    </Popup>
  )
}

export default DeletionPopup
