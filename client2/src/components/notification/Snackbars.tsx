import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { withStore } from 'store/store'
import { hideSnackbar } from 'store/actions'

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'fixed',
    zIndex: 999999,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    left: theme.spacing.unit * 2
  },
  snackbar: {
    position: 'relative',
    marginBottom: theme.spacing.unit * 2
  },
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  }
})

interface Props {
  onClose: (id: string) => void
  messages: { id: string, message: string }[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  closed: string[] // List of closed 
}


class Snackbars extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { closed: [] }
  }

  onClose(id: string) {
    this.setState({ closed: this.state.closed.concat([ id ]) })
  }

  onExited(id: string) {
    this.setState({ closed: this.state.closed.filter(i => i !== id) })
    this.props.onClose(id)
  }

  render() {
    const { classes, messages } = this.props

    const snackbars = messages.map((message) => {
      return (
        <Snackbar
          className={classes.snackbar}
          key={message.id}
          open={this.state.closed.indexOf(message.id) < 0}
          autoHideDuration={3500}
          onClose={(_, reason: string) => {
            if(reason !== 'clickaway')
              this.onClose(message.id)
          }}
          onExited={() => this.onExited(message.id)}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{message.message}</span>}
          action={[
            <IconButton
              key={`close`}
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={() => this.onClose(message.id)}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      )
    })
  
    return (
      <div className={classes.root} >
        {snackbars}
      </div>
    )
  }

}

const SnackbarWithStyle = withStyles(styles) <PropsWithStyle> (Snackbars)

export default withStore(SnackbarWithStyle, (state, dispatch) => ({
  onClose: (id: string) => dispatch(hideSnackbar(id)),
  messages: state.snackbar.messages
}))
