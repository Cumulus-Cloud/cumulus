import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Avatar from '@material-ui/core/Avatar'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { User } from 'models/User'

import styles from './styles'


interface Props {
  user: User
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
          <MenuItem onClick={() => this.closeMenu()}>Profile</MenuItem>
          <MenuItem onClick={() => this.closeMenu()}>My account</MenuItem>
          <MenuItem onClick={() => this.closeMenu()}>Logout</MenuItem>
        </Menu>
      </>
    )

  }

}


export default withStyles(styles)(UserBadge)
