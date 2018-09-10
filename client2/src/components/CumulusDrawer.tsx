import * as React from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import CloudIcon from '@material-ui/icons/CloudQueue'
import { Typography } from '@material-ui/core';


const styles = (theme: Theme) => createStyles({
  drawerPaper: {
    backgroundColor: 'rgb(246, 251, 251)', // TODO via theme
    position: 'relative',
    width: 240,
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
  searchElements: JSX.Element
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
    const { classes, searchElements, actionElements, contextualActionElements, showDynamicDrawer } = this.props

    return (
      <div>
        <SwipeableDrawer
          open={showDynamicDrawer}
          onClose={() => this.toggleDrawer()}
          onOpen={() => this.toggleDrawer()}
        >
          <List>{searchElements}</List>
          <Divider style={{height: 1}} />
          <List>{actionElements}</List>
          <Divider style={{height: 1}} />
          <List>{contextualActionElements}</List>
        </SwipeableDrawer>
        <Drawer
          variant="permanent"
          className={classes.drawerStatic}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.logoContainer} >
            <Typography variant="headline" className={classes.logoText} >
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

  // <List>{searchElements}</List>
}

export default withStyles(styles) <PropsWithStyle> (CumulusDrawer)
