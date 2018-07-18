import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import { WithStyles } from '@material-ui/core/styles/withStyles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import AccountCircle from '@material-ui/icons/AccountCircle'
import CloudIcon from '@material-ui/icons/CloudQueue'
import MenuButton from '@material-ui/icons/Menu'
import { withStyles } from '@material-ui/core/styles'

import { isAdmin, User } from '../models/User'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  menuButtonMobile: {
    display: 'none',
    [theme.breakpoints.down('sm')]: {
      display: 'flex'
    }
  },
  menuButtonDesktop: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  appName: {
    flex: 1,
  }
})

interface Props {
  user: User
  showDrawer: () => void
  showAccountPanel: () => void
  showAdminPanel: () => void
  logout: () => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  popupOpened: boolean
  drawer: boolean
  anchorEl?: HTMLElement
}

/**
 * Main application toolbar. The toolbar will react to smaller screen and display a button to
 * show the drawer.
 */
class CumulusAppBar extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  openMenu(e: HTMLElement) {
    this.setState({...this.state, anchorEl: e })
  }

  closeMenu() {
    this.setState({...this.state, anchorEl: undefined })
  }

  showDrawer() {
    this.closeMenu()
    this.props.showDrawer()
  }

  showAccountPanel() {
    this.closeMenu()
    this.props.showAccountPanel()
  }

  showAdminPanel() {
    this.closeMenu()
    this.props.showAdminPanel()
  }

  logout() {
    this.closeMenu()
    this.props.logout()
  }

  render() {
    const { user, classes } = this.props
    const admin = isAdmin(user)

    return (
      <AppBar position="absolute" className={classes.root}>
        <Toolbar>
          <IconButton className={`${classes.menuButton} ${classes.menuButtonDesktop}`} color="inherit" aria-label="Menu">
            <CloudIcon />
          </IconButton>
          <IconButton className={`${classes.menuButton} ${classes.menuButtonMobile}`} color="inherit" aria-label="Menu" onClick={() => this.showDrawer()}>
            <MenuButton />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.appName}>
              Cumulus
          </Typography>
          <IconButton onClick={(e) => this.openMenu(e.currentTarget)} color="inherit">
            <AccountCircle/>
          </IconButton>
          <Menu id="simple-menu" anchorEl={this.state.anchorEl} open={Boolean(this.state.anchorEl)} onClose={() => this.closeMenu()}>
            <MenuItem onClick={() => this.showAccountPanel()}>Mon compte</MenuItem>
            <MenuItem onClick={() => this.logout()}>Se déconnecter</MenuItem>
            { admin ?
                <span>
                  <Divider />
                  <MenuItem onClick={() => this.showAdminPanel()}>Paneau d'administration</MenuItem>
                </span> :
                <span/>
            }
          </Menu>
        </Toolbar>
      </AppBar>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (CumulusAppBar)
