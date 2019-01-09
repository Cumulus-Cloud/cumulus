import  React from 'react'
import CloudUpload from '@material-ui/icons/CloudUpload'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import DeleteIcon from '@material-ui/icons/Delete'
import ShareIcon from '@material-ui/icons/Share'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import withMobileDialog from '@material-ui/core/withMobileDialog'

import Layout from 'components/utils/layout/Layout'
import { ActionGroup } from 'components/utils/layout/Menu'
import CreationPopup from 'components/popups/creation/CreationPopup'
import DeletionPopup from 'components/popups/deletion/DeletionPopup'
import DetailPopup from 'components/popups/detail/DetailPopup'
import UploadPopup from 'components/popups/upload/UploadPopup'
import UploadProgressPopup from 'components/popups/upload/UploadProgressPopup'
import FileList from 'components/fs/fileList/FileList'

import { FsNode } from 'models/FsNode'

import { withStore, connect } from 'store/store'
import { showPopup } from 'store/actions/popups'
import { selectedNodes } from 'store/states/fsState'


interface Props {
  showCreationPopup: () => void
  showUploadPopup: () => void
  showDeletionPopup: () => void
  selection: FsNode[]
}


class FileExplorer extends React.Component<Props> {

  showCreationPopup = () => {
    this.props.showCreationPopup()
  }

  showUploadPopup = () => {
    this.props.showUploadPopup()
  }

  showDeletionPopup = () => {
    this.props.showDeletionPopup()
  }

  render() {
    const { selection } = this.props

    const actions: ActionGroup = {
      actions: [
        {
          icon: <CreateNewFolderIcon />,
          label: 'Créer un dossier',
          action: this.showCreationPopup
        },
        {
          icon: <CloudUpload />,
          label: 'Uploader un fichier',
          action: this.showUploadPopup
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
          label: 'Déplacer la sélection'
        },
        {
          icon: <DeleteIcon />,
          label: 'Supprimer la sélection'
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

      </Layout>
    )
  }
}


const mappedProps =
  connect((state, dispatch) => {
    const selectedContent = state.fs.selectedContent
    const content = state.fs.content || []
    const selection = selectedNodes(content, selectedContent)

    return {
      selection: selection,
      user: user,
      showCreationPopup: () => dispatch(showPopup({ type: 'DIRECTORY_CREATION' })),
      showUploadPopup: () => dispatch(showPopup({ type: 'FILE_UPLOAD' })),
      showDeletionPopup: () => dispatch(showPopup({ type: 'NODE_DELETION', nodes: selection }))
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(FileExplorer), mappedProps)
