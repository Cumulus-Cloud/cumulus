import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import Grow from '@material-ui/core/Grow'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'


const styles = (_: Theme) => createStyles({
  pageRoot: {
    flexGrow: 1,
    display: 'flex',
  }
})


type PropsWithStyle = WithStyles<typeof styles>

class Page extends React.Component<PropsWithStyle> {

  render() {
    const { children, classes } = this.props

    return (
      <Grow in={true} timeout={700} >
        <div className={ classes.pageRoot } >
          { children }
        </div>
      </Grow>
    )
  }
}


export default withStyles(styles)(Page)
