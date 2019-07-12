import React from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import IconButton from '@material-ui/core/IconButton'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import CloudIcon from '@material-ui/icons/CloudQueue'
import MenuIcon from '@material-ui/icons/Menu'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import { useMenu } from 'store/store'


const styles = (theme: Theme) => createStyles({
  drawerPaper: {
    backgroundColor: 'rgb(246, 251, 251)', // TODO via theme
    position: 'relative',
    width: 240,
  },
  drawerBar: {
    backgroundColor: 'rgb(246, 251, 251)', // TODO via theme
    position: 'relative',
    width: 48,
    height: '100%',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    }
  },
  drawerStatic: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  logoContainer: {
    height: '70px'
  },
  logoText: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.light,
    paddingRight: theme.spacing() * 2,
    paddingLeft: theme.spacing() * 3,
    paddingTop: '2px'
  },
  logo: {
    fontSize: '4rem',
    paddingRight: theme.spacing() * 2
  }
})

export type ActionGroup = {
  title?: string
  enabled?: boolean
  actions: MenuAction[]
}

export type MenuAction = {
  icon?: JSX.Element
  label: string
  action?: () => void
  enabled?: boolean
}

type Props = {
  actionGroup: ActionGroup[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

function CumulusDrawer(props: PropsWithStyle) {

  const { forceMenu, toggleMenu, show } = useMenu()

  function buildActionGroup(actionGroup: ActionGroup): JSX.Element {
    const { title, enabled, actions } = actionGroup
    const groupDisabled = enabled === false

    return (
      <div>
        {
          title && (
            <ListItem
              disabled={ groupDisabled }
              disableRipple
              button
              style={{ paddingRight: '0px' }}
            >
              <ListItemText primary={title} />
            </ListItem>
          )
        }
        {
          actions.map((menuAction, index) => {
            const disabled = groupDisabled || menuAction.enabled === false

            return (
              <ListItem
                key={ `menu-item-${index}` }
                disabled={ disabled }
                button
                onClick={() => {
                  menuAction.action && menuAction.action()
                  forceMenu(false) // TODO fix focus stolen
                }}
              >
                {
                  menuAction.icon &&
                  <ListItemIcon>
                    { menuAction.icon }
                  </ListItemIcon>
                }
                <ListItemText primary={ menuAction.label } />
              </ListItem>
            )
          })
        }
      </div>
    )
  }

  const { classes, actionGroup } = props

  const actionsElement =
    actionGroup.map((group, index) => (
      <div key={`menu-group-${index}`} >
        <Divider style={{ height: 1 }} />
        <List>{ buildActionGroup(group) }</List>
      </div>
    ))

  return (
    <div>
      <SwipeableDrawer
        open={show}
        classes={{ paper: classes.drawerPaper }}
        onClose={toggleMenu}
        onOpen={toggleMenu}
      >
        <div className={ classes.logoContainer } >
          <Typography variant="h5" className={classes.logoText} >
            <CloudIcon  className={classes.logo} /> <div>Cumulus</div>
          </Typography>
        </div>
        {
          actionsElement
        }
      </SwipeableDrawer>
      <div className={classes.drawerBar} >
        <IconButton onClick={toggleMenu} >
          <MenuIcon />
        </IconButton>
      </div>
      <Drawer
        variant="permanent"
        className={classes.drawerStatic}
        classes={{ paper: classes.drawerPaper }}
      >
        <div className={ classes.logoContainer } >
          <Typography variant="h5" className={classes.logoText} >
            <CloudIcon  className={classes.logo} /> <div>Cumulus</div>
          </Typography>
        </div>
        {
          actionsElement
        }
      </Drawer>
    </div>
  )

}

export default withStyles(styles)(CumulusDrawer)
