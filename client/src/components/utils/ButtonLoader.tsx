
import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import Button, { ButtonProps } from '@material-ui/core/Button'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'

const styles = (_: Theme) => createStyles({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
})

type Props = ButtonProps & { loading?: boolean }
type PropsWithStyle = Props & WithStyles<typeof styles>

function ButtonLoader(props: PropsWithStyle) {
  const { loading, disabled, classes, children, ...buttonProps } = props

  return (
    <Button disabled={ disabled !== undefined ? disabled : loading } {...buttonProps} >
      { children }
      { loading && <CircularProgress size={24} className={classes.buttonProgress} /> }
    </Button>
  )
}

export default withStyles(styles)(ButtonLoader)
