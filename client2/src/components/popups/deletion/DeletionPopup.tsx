import  React from 'react'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { Checkbox, DialogContentText, FormControlLabel } from '@material-ui/core'

import { connect, withStore } from 'store/store'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'

import { ApiError } from 'models/ApiError'
import { FsNode } from 'models/FsNode'

import NoWrap from 'components/utils/NoWrap'
import Popup from 'components/utils/Popup'

import { deleteNodes } from 'store/actions/nodeDeletion'


const popupType: FsPopupType = 'NODE_DELETION'

interface Props {
  onClose: () => void
  onDelete: (deleteContent: boolean) => void
  open: boolean
  fullScreen?: boolean
  loading: boolean
  nodes: FsNode[]
  error?: ApiError
}

interface State {
  deleteContent: boolean
}


class DeletionPopup extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = { deleteContent: false }
  }

  onClose() {
    this.props.onClose()
  }

  onDeleteNode() {
    this.props.onDelete(this.state.deleteContent)
  }

  onToggleDeleteContent(deleteContent: boolean) {
    this.setState({ deleteContent })
  }

  getMessage() {
    const { nodes } = this.props

    const hasFile = !!nodes.find(node => node.nodeType === 'FILE')
    const hasDirectory = !!nodes.find(node => node.nodeType === 'DIRECTORY')

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

  render() {
    const { open, loading, nodes, error } = this.props
    const { deleteContent } = this.state
  
    const hasDirectory = !!nodes.find(node => node.nodeType === 'DIRECTORY')

    return (
      <Popup
        title="Confirmation de suppression"
        action="Supprimer"
        cancel="Annuler"
        error={ error }
        loading={ loading }
        open={ open }
        onClose={ () => this.onClose() }
        onValidate={ () => this.onDeleteNode() }
      >
        <DialogContentText>
          { this.getMessage() }
        </DialogContentText>
        { hasDirectory &&
          <FormControlLabel
            disabled={ loading }
            control={<Checkbox checked={ deleteContent } color="primary" onChange={ (value) => this.onToggleDeleteContent(value.target.checked) } />}
            label={<DialogContentText>Également supprimé le contenu des dossiers ?</DialogContentText>}
          />
        }
      </Popup>
    )
  }

}

const mappedProps =
  connect((state, dispatch) => {
    const nodes = state.popups.target
    
    return {
      open: state.popups.open === popupType,
      nodes: nodes,
      loading: state.nodeDeletion.loading,
      error: state.nodeDeletion.error,
      onClose: () => {
        dispatch(hidePopup())
      },
      onDelete: (deleteContent: boolean) => {
        dispatch(deleteNodes({ nodes, deleteContent })).then((state) => {
          if(!state.nodeDeletion.error)
            dispatch(hidePopup())
        })
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(DeletionPopup), mappedProps)
