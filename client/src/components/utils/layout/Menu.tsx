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

import { withStore, connect } from 'store/store'
import { forceMenu, toggleMenu } from 'store/actions/menu';

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
    paddingRight: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 3,
    paddingTop: '2px'
  },
  logo: {
    fontSize: '4rem',
    paddingRight: theme.spacing.unit * 2
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
  forceMenu: (state: boolean) => void
  onMenuToggle: () => void
  showDynamicMenu: boolean
  actionGroup: ActionGroup[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

class CumulusDrawer extends React.Component<PropsWithStyle> {

  toggleDrawer = () => {
    this.props.onMenuToggle()
  }

  buildActionGroup(actionGroup: ActionGroup): JSX.Element {
    const { forceMenu } = this.props
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

  render() {
    const { classes, actionGroup, showDynamicMenu } = this.props

    const actionsElement =
      actionGroup.map((group, index) => (
        <div key={`menu-group-${index}`} >
          <Divider style={{ height: 1 }} />
          <List>{ this.buildActionGroup(group) }</List>
        </div>
      ))

    return (
      <div>
        <SwipeableDrawer
          open={ showDynamicMenu }
          classes={{ paper: classes.drawerPaper }}
          onClose={ this.toggleDrawer }
          onOpen={ this.toggleDrawer }
        >
          <div className={ classes.logoContainer } >
            <Typography variant="h5" className={ classes.logoText } >
              <CloudIcon  className={ classes.logo } /> <div>Cumulus</div>
            </Typography>
          </div>
          {
            actionsElement
          }
        </SwipeableDrawer>
        <div className={ classes.drawerBar } >
          <IconButton onClick={ this.toggleDrawer } >
            <MenuIcon />
          </IconButton>
        </div>
        <Drawer
          variant="permanent"
          className={ classes.drawerStatic }
          classes={{ paper: classes.drawerPaper }}
        >
          <div className={ classes.logoContainer } >
            <Typography variant="h5" className={ classes.logoText } >
              <CloudIcon  className={ classes.logo } /> <div>Cumulus</div>
            </Typography>
          </div>
          {
            actionsElement
          }
        </Drawer>
      </div>
    )
  }

}

const mappedProps =
  connect((state, dispatch) => ({
    showDynamicMenu: state.menu.show,
    forceMenu: (show: boolean) => dispatch(forceMenu(show)),
    onMenuToggle: () => dispatch(toggleMenu())
  }))

export default withStore(withStyles(styles)(CumulusDrawer), mappedProps)
