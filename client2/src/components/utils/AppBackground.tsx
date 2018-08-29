import * as React from 'react'
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core'

import withRoot from 'components/utils/withRoot'

const styles = (_: Theme) => createStyles({
  backgroundFilter: {
    zIndex: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '100%',
    // TODO may not work everywhere
    background: 'radial-gradient(ellipse at center, #1e5799 0%,rgba(54, 151, 142, 0.8) 0%,#0C526C 100%,#3d7eaa 100%,#182848 100%,#6e48aa 100%,#6e48aa 100%)',
    opacity: .7
  },
  background: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    // TODO internalize
    backgroundImage: 'url(https://cumulus-cloud.github.io/assets/img/template/bg3.jpg)',
    backgroundSize: 'cover'
  }
})

interface PropsTest {
  children: JSX.Element
}

type PropsWithStyle = PropsTest & WithStyles<typeof styles>

interface State {}

class Test extends React.Component<PropsWithStyle, State> {

  render() {
    const { children, classes } = this.props

    return (
      <div className={classes.background} >
        <div className={classes.backgroundFilter} />
        {children}
      </div>
    )
  }

}

export default withStyles(styles) <PropsWithStyle> (withRoot(Test))
