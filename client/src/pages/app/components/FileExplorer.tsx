import  React from 'react'
import CloudUpload from '@material-ui/icons/CloudUpload'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import DeleteIcon from '@material-ui/icons/Delete'
import ShareIcon from '@material-ui/icons/Share'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'

import Layout from 'components/utils/layout/Layout'
import { ActionGroup } from 'components/utils/layout/Menu'
import CreationPopup from 'components/popups/creation/CreationPopup'
import DeletionPopup from 'components/popups/deletion/DeletionPopup'
import DetailPopup from 'components/popups/detail/DetailPopup'
import UploadPopup from 'components/popups/upload/UploadPopup'
import UploadProgressPopup from 'components/popups/upload/UploadProgressPopup'
import FileList from 'components/fs/fileList/FileList'
import MovePopup from 'components/popups/move/MovePopup'

import { selectedNodes } from 'store/states/fsState'
import { usePopups, useFilesystem } from 'store/storeHooks'


function FileExplorer() {

  const { content, selectedContent } = useFilesystem()
  const { showPopup } = usePopups()

  const selection = selectedNodes(content || [], selectedContent)

  const actions: ActionGroup = {
    actions: [
      {
        icon: <CreateNewFolderIcon />,
        label: 'Créer un dossier',
        action: () => showPopup('DIRECTORY_CREATION')
      },
      {
        icon: <CloudUpload />,
        label: 'Uploader un fichier',
        action: () => showPopup('FILE_UPLOAD')
      },
      {
        icon: <ShareIcon />,
        label: 'Partager un dossier'
      }
    ]
  }

  const contextualActions: ActionGroup = {
    title :
      selection.length <= 0 ? 'Aucun fichier selectionné' : (
        selection.length === 1 ? '1 fichier selectionné' :
        `${selection.length} fichiers selectionés`
      ),
    enabled: selection.length > 0,
    actions: [
      {
        icon: <CompareArrowsIcon />,
        label: 'Déplacer la sélection',
        action: () => showPopup('NODE_MOVE', selection)
      },
      {
        icon: <DeleteIcon />,
        label: 'Supprimer la sélection',
        action: () => showPopup('NODE_DELETION', selection)
      },
      {
        icon: <ShareIcon />,
        label: 'Partager la sélection'
      }
    ]
  }

  return (
    <Layout actions={ [ actions, contextualActions ] } >
      <FileList />

      <CreationPopup/>
      <UploadPopup />
      <DetailPopup />
      <DeletionPopup />
      <UploadProgressPopup />
      <MovePopup />

    </Layout>
  )
}


export default FileExplorer
