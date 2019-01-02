import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Avatar from '@material-ui/core/Avatar'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import { connect, withStore } from 'store/store'
import { signOutUser } from 'store/actions/authentication'

import { User } from 'models/User'

import Routes from 'services/routes'

import styles from './styles'


interface Props {
  user: User
  onShowProfile: () => void
  onShowEvents: () => void
  onLogout: () => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  anchorEl?: HTMLElement | null
}

class UserBadge extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  onShowProfile = () => {
    this.props.onShowProfile()
    this.closeMenu()
  }

  onShowEvents = () => {
    this.props.onShowEvents()
    this.closeMenu()
  }

  onLogout= () => {
    this.props.onLogout()
    this.closeMenu()
  }

  onOpenMenu(event: React.MouseEvent<HTMLElement>) {
    this.setState({ anchorEl: event.currentTarget })
  }

  closeMenu() {
    this.setState({ anchorEl: undefined })
  }

  render() {
    const { user, classes } = this.props
    const { anchorEl } = this.state

    return (
      <>
        <Avatar className={ classes.avatar } onClick={(e) => this.onOpenMenu(e)} >{ user.login.charAt(0) }</Avatar>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => this.closeMenu()}
        >
          <MenuItem onClick={ this.onShowProfile }>Mon profil</MenuItem>
          <MenuItem onClick={ this.onShowEvents }>Mes dernières actions</MenuItem>
          <MenuItem onClick={ this.onLogout }>Se déconnecter</MenuItem>
        </Menu>
      </>
    )

  }

}


const mappedProps =
  connect(({ router }, dispatch) => ({
    onShowProfile: () => {
      // TODO
    },
    onShowEvents: () => {
      router.push(Routes.app.events)
    },
    onLogout: () => {
      dispatch(signOutUser())
    }
  }))

export default withStore(withStyles(styles)(UserBadge), mappedProps)
