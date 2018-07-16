import * as React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'


const styles = (theme: Theme) => createStyles({
  root: {
    position: 'fixed',
    zIndex: 999999,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)'
  },
  snackbar: {
    position: 'relative',
    marginBottom: theme.spacing.unit * 4
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

interface State {}


class Snackbars extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  onClose(id: string) {
    console.log(">>>>>" + id)
    this.props.onClose(id)
  }

  render() {
    const { classes, messages } = this.props

    const snackbars = messages.map((message) => {
      return (
        <Snackbar
          className={classes.snackbar}
          key={message.id}
          open={true}
          autoHideDuration={150000}
          onClose={() => this.onClose(message.id)}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{message.message}</span>}
          action={[
            <IconButton
              key="close"
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

export default withStyles(styles) <PropsWithStyle> (Snackbars)
