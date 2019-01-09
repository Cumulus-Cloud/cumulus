import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'

import Menu, { ActionGroup } from 'components/utils/layout/Menu'
import NotificationsContainer from 'components/notification/NotificationsContainer'


const styles = (_: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100%'
  }
})


type Props = {
  actions?: ActionGroup[]
}

type PropsWithStyle = Props & WithStyles<typeof styles>

class Layout extends React.Component<PropsWithStyle, {}> {

  render() {
    const { actions, children, classes } = this.props

    return (
      <div className={classes.root}>
        <Menu actionGroup={ actions || [] } />
        { children }
        <NotificationsContainer />
      </div>
    )

  }

}

export default withStyles(styles)(Layout)
