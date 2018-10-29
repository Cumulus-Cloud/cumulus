import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import ButtonLoader from 'components/utils/ButtonLoader'
import DialogContentText from '@material-ui/core/DialogContentText'
import Grow from '@material-ui/core/Grow'

import Error from 'components/utils/Error'
import { ApiError } from 'models/ApiError'


const styles = (theme: Theme) => createStyles({
  root: {
    width: 500,
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      height: '100%',
      display: 'flex',
      width: 'inherit'
    }
  },
  content: {
    flex: 1
  }
})


interface Props {
  onClose: () => void
  onValidate: () => void
  open: boolean
  fullScreen?: boolean
  disabled?: boolean
  loading: boolean
  title: string,
  cancel: string
  action: string,
  error?: ApiError
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  deleteContent: boolean
}


class DeletionPopup extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { deleteContent: false }
  }

  onClose() {
    this.props.onClose()
  }

  onValidate(e: React.FormEvent) {
    e.preventDefault()
    this.props.onValidate()
  }

  onToggleDeleteContent(deleteContent: boolean) {
    this.setState({ deleteContent })
  }

  render() {
    const { classes, fullScreen, open, loading, disabled, title, action, cancel, children, error } = this.props

    return (
      <Dialog
        fullScreen={ fullScreen }
        open={ open }
        onClose={ () => this.onClose() }
      >
        <form onSubmit={ (e) => this.onValidate(e) } className={ classes.root } >
          <DialogTitle id="responsive-dialog-title">
            { title }
          </DialogTitle>
          <DialogContent className={ classes.content } >
            { children }
            { error &&
              <Grow in>
                <Error Component={ DialogContentText } >
                  { error.message }
                </Error>
              </Grow>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => this.onClose() } disabled={ loading }>
              { cancel }
            </Button>
            <ButtonLoader loading={ loading } disabled={ disabled } color="primary" type="submit" >
              { action }
            </ButtonLoader>
          </DialogActions>
        </form>
      </Dialog>
    )
  }

}

export default withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (DeletionPopup))
