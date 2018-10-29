import  React from 'react'
import { ComponentType } from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'


const styles = (theme: Theme) => createStyles({
  error: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderLeft: '7px solid #f5c6cb',
    padding: '1rem',
    marginTop: '1rem',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[2]
  }
})


type Props = {
  Component?: ComponentType<{ className?: string }>,
  children?: React.ReactNode
}

type PropsWithStyle = Props & WithStyles<typeof styles>

function Error(props: PropsWithStyle) {
  const { Component, children, classes } = props

  // Default to <div/>
  const ErrorComponent = Component || ((props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} >{ props.children }</div>)

  return <ErrorComponent className={ classes.error } >{ children }</ErrorComponent>
}

export default withStyles(styles) (Error)
