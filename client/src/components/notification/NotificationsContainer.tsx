import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { useNotifications } from 'store/storeHooks'


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
  }
})


type PropsWithStyle = WithStyles<typeof styles>


function Snackbars(props: PropsWithStyle) {

  const [closed, setClosed] = React.useState<string[]>([])

  const { messages, hideNotification } = useNotifications()

  const { classes } = props

  const close = (id: string) => setClosed(closed.concat([ id ]))

  const exited = (id: string) => {
    setClosed(closed.filter(i => i !== id))
    hideNotification(id)
  }

  const snackbars = messages.map((message) => {
    return (
      <Snackbar
        className={classes.snackbar}
        key={message.id}
        open={closed.indexOf(message.id) < 0}
        autoHideDuration={3500}
        onClose={(_, reason: string) => {
          if(reason !== 'clickaway')
            close(message.id)
        }}
        onExited={() => exited(message.id)}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{message.message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={() => close(message.id)}
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

export default withStyles(styles)(Snackbars)
