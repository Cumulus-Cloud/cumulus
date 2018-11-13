import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import Grow from '@material-ui/core/Grow'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import RefreshIcon from '@material-ui/icons/Refresh'
import CancelIcon from '@material-ui/icons/Cancel'
import EditIcon from '@material-ui/icons/Edit'
import ArrowIcon from '@material-ui/icons/KeyboardArrowRight'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { Typography, List } from '@material-ui/core'

import CumulusDrawer from 'components/CumulusDrawer'
import NotificationsContainer from 'components/notification/NotificationsContainer'

import { withStore, connect } from 'store/store'
import { showNotification } from 'store/actions/notifications'
import Api from 'services/api';


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100%'
  },
  content: {
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  margin: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.primary.light,
    color: 'white'
  },
  drawerStatic: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  main: {
    flexGrow: 1,
    backgroundColor: 'white',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    overflow: 'auto'
  },
  stack: {
    marginLeft: '100px',
    marginRight: '100px'
  },
  stackElement: {
    paddingBottom: '2px',
    paddingTop: '2px'
  }
})


interface Props {
  showNotification: (message: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  popupOpened: boolean
  drawer: boolean
}


class FailurePage extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  toggleDrawer() {
    this.setState({ drawer: !this.state.drawer })
  }

  forceDrawer(state: boolean) {
    this.setState({ drawer: state })
  }

  showNotification(message: string) {
    this.props.showNotification(message)
  }

  render() {
    const { classes } = this.props
    const stack = error ? error.stack : []

    const actionElements = (
      <div>
        <ListItem button onClick={() => {
          Api.management.reload()
            .then((result) => {
              if ('errors' in result)
                this.showNotification(`Cumulus server reloading failed: ${result.message}`)
              else {
                this.showNotification('Cumulus server reloading...')
                setTimeout(() => {
                  location.reload();
                }, 8000)
              }
            })
            .catch(() => {
              this.showNotification('Cumulus server reloading failed')
            })
          this.forceDrawer(false) // TODO fix focus stolen
        }} >
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary="Recharger le serveur" />
        </ListItem>
        <ListItem button onClick={() => {
          Api.management.reload()
            .then((result) => {
              if ('errors' in result)
                this.showNotification(`Cumulus server stop failed: ${result.message}`)
              else {
                this.showNotification('Stopping Cumulus server...')
                setTimeout(() => {
                  location.reload();
                }, 8000)
              }
            })
            .catch(() => {
              this.showNotification('Cumulus server stop failed')
            })
          this.forceDrawer(false) // TODO fix focus stolen
        }} >
          <ListItemIcon>
            <CancelIcon />
          </ListItemIcon>
          <ListItemText primary="Arrêter le serveur" />
        </ListItem>
        <ListItem button onClick={() => {
          this.showNotification('Not implemented yet')
          this.forceDrawer(false) // TODO fix focus stolen
        }} >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="Modifier la configuration" />
        </ListItem>
      </div>
    )

    return (
      <Grow in={true} timeout={700} >
        <div className={ classes.root }>
          <CumulusDrawer
            onDrawerToggle={ () => this.toggleDrawer() }
            showDynamicDrawer={ this.state.drawer }
            actionElements={ actionElements }
            contextualActionElements={ <span/> }
          />

          <main className={ classes.main }>
            <div className={ classes.content }>
              <Typography variant="h2" gutterBottom >
                Oh no, an error occurred! 😢
              </Typography>
              <Typography variant="body1" gutterBottom>
                An error preventing the Cumulus server to start has occurred. The server is now started in recovery mode to show you what went wrong.
              </Typography>
              <br/>
              <Typography variant="body1" gutterBottom>
                Errors usually come from configuration error such as an unreachable database.
              </Typography>
              <br/>
              <Typography variant="body1" gutterBottom>
                Use the stack trace below to see what when wrong. In futures versions, Cumulus will try to guess what went wrong.
              </Typography>
              <List dense className={ classes.stack }>
                {
                  stack.map((call, i) => {
                    return (
                      <ListItem button key={i} className={ classes.stackElement } >
                        <ListItemIcon>
                          <ArrowIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${call.object}.${call.func}(${call.line})`}
                        />
                      </ListItem>
                    )
                  })
                }
              </List>
            </div>
          </main>

          <NotificationsContainer />

        </div>

      </Grow>
    )
  }
}


const mappedProps =
  connect((_, dispatch) => ({
    showNotification: (message: string) => dispatch(showNotification(message))
  }))

export default withStore(withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (FailurePage)), mappedProps)
