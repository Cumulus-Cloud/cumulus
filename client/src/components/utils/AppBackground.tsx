import  React from 'react'
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


interface Props {
  children: JSX.Element
}

type PropsWithStyle = Props & WithStyles<typeof styles>


function AppBackground(props: PropsWithStyle) {

  const { children, classes } = props

  return (
    <div className={classes.background} >
      <div className={classes.backgroundFilter} />
      {children}
    </div>
  )

}

export default withStyles(styles)(withRoot(AppBackground))
