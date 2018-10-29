import  React from 'react'
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
import { Typography } from '@material-ui/core'


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

interface Props {
  onDrawerToggle: () => void
  showDynamicDrawer: boolean
  actionElements: JSX.Element
  contextualActionElements: JSX.Element
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}


class CumulusDrawer extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = {}
  }

  toggleDrawer() {
    this.props.onDrawerToggle()
  }

  render() {
    const { classes, actionElements, contextualActionElements, showDynamicDrawer } = this.props

    return (
      <div>
        <SwipeableDrawer
          open={showDynamicDrawer}
          classes={{ paper: classes.drawerPaper }}
          onClose={() => this.toggleDrawer()}
          onOpen={() => this.toggleDrawer()}
        >
          <div className={classes.logoContainer} >
            <Typography variant="h5" className={classes.logoText} >
              <CloudIcon  className={classes.logo} /> <div>Cumulus</div>
            </Typography>
          </div>
          <Divider style={{height: 1}} />
          <List>{actionElements}</List>
          <Divider style={{height: 1}} />
          <List>{contextualActionElements}</List>
        </SwipeableDrawer>
        <div className={classes.drawerBar} >
          <IconButton onClick={() => this.toggleDrawer()} >
            <MenuIcon />
          </IconButton>
        </div>
        <Drawer
          variant="permanent"
          className={classes.drawerStatic}
          classes={{ paper: classes.drawerPaper }}
        >
          <div className={classes.logoContainer} >
            <Typography variant="h5" className={classes.logoText} >
              <CloudIcon  className={classes.logo} /> <div>Cumulus</div>
            </Typography>
          </div>
          <Divider style={{height: 1}} />
          <List>{actionElements}</List>
          <Divider style={{height: 1}} />
          <List>{contextualActionElements}</List>
        </Drawer>
      </div>
    )
  }

}



export default withStyles(styles)(CumulusDrawer)
