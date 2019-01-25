import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Avatar from '@material-ui/core/Avatar'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import { useAuthentication, useRouting } from 'store/store'

import styles from './styles'


type PropsWithStyle = WithStyles<typeof styles>

function UserBadge(props: PropsWithStyle) {

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null | undefined>(undefined)

  const { user, signOutUser } = useAuthentication()
  const { showEvents } = useRouting()

  const { classes } = props

  const closeMenu = () => setAnchorEl(undefined)
  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)

  const onShowProfile = () => {
    // showProfile() TODO
    closeMenu()
  }

  const onShowEvents = () => {
    showEvents()
    closeMenu()
  }

  const onLogout= () => {
    signOutUser()
    closeMenu()
  }

  return (
    <>
      <Avatar className={classes.avatar} onClick={openMenu} >{ user ? user.login.charAt(0) : '?' }</Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        <MenuItem onClick={onShowProfile}>Mon profil</MenuItem>
        <MenuItem onClick={onShowEvents}>Mes dernières actions</MenuItem>
        <MenuItem onClick={onLogout}>Se déconnecter</MenuItem>
      </Menu>
    </>
  )

}


export default withStyles(styles)(UserBadge)
