import  React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import CircularProgress from '@material-ui/core/CircularProgress'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Typography from '@material-ui/core/Typography'

import { connect, withStore } from 'store/store'
import { hidePopup } from 'store/actions/popups'
import { FsPopupType } from 'store/states/popupsState'

import { ApiError } from 'models/ApiError'
import { FsNode } from 'models/FsNode'

import styles from './styles'


const popupType: FsPopupType = 'NODE_DELETION'

interface Props {
  onClose: () => void
  onDelete: () => void
  open: boolean
  fullScreen?: boolean
  loading: boolean
  nodes: FsNode[]
  error?: ApiError
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}


class DeletionPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  onClose() {
    this.props.onClose()
  }

  onCreateDirectory(e: React.FormEvent) {
    e.preventDefault()
    this.props.onDelete()
  }

  onDirectoryNameChange(directoryName: string) {
    this.setState({ directoryName })
  }

  getMessage() {
    const { nodes } = this.props

    const hasFile = !!nodes.find(node => node.nodeType === 'FILE')
    const hasDirectory = !!nodes.find(node => node.nodeType === 'DIRECTORY')

    // TODO i18n
    if (nodes.length == 1) {
      if (hasFile)
        return `Êtes-vous certain de vouloir supprimer le fichier ${nodes[0].name} ?`
      else
        return `Êtes-vous certain de vouloir supprimer le dossier ${nodes[0].name} ?`
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
    const { classes, fullScreen, open, loading } = this.props
  
    // TODO show error

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
            <Typography variant="body1">
              { this.getMessage() }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.onClose()} disabled={loading}>
              Annuler
            </Button>
            <Button disabled={loading} color="primary" type="submit" >
              Supprimer
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
    const nodes = state.popups.target
    
    return {
      open: state.popups.open === popupType,
      nodes: nodes,
      loading: state.createDirectory.loading, // TODO
      error: state.createDirectory.error,     // TODO
      onClose: () => {
        dispatch(hidePopup())
      },
      onDelete: () => {
        // TODO
        //dispatch(createDirectory(path)).then((state) => {
        //  if(!state.createDirectory.error)
        //    dispatch(hidePopup())
        //})
      }
    }
  })

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (DeletionPopup)), mappedProps)
