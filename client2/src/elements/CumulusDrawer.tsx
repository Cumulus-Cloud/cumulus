import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import * as React from 'react'


const styles = (theme: Theme) => createStyles({
  drawerPaper: {
    position: 'relative',
    width: 240,
  },
  drawerStatic: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  toolbar: theme.mixins.toolbar
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
    const { searchElements, actionElements, contextualActionElements, showDynamicDrawer } = this.props

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
          className={this.props.classes.drawerStatic}
          classes={{
            paper: this.props.classes.drawerPaper,
          }}
        >
          <div className={this.props.classes.toolbar} />
          <List>{searchElements}</List>
          <Divider style={{height: 1}} />
          <List>{actionElements}</List>
          <Divider style={{height: 1}} />
          <List>{contextualActionElements}</List>
        </Drawer>
      </div>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (CumulusDrawer)
