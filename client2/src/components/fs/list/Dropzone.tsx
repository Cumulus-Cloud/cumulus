import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Fade from '@material-ui/core/Fade'


const styles = (_: Theme) => createStyles({
  root: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    color: '#fff',
    zIndex: 9999,
    display: 'flex'
  },
  inner: {
    border: '5px lightgray dotted',
    margin: 11,
    borderRadius: 33,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    width: 200,
    height: 200
  },
  text: {
    color: 'white'
  }
})


type Props = WithStyles<typeof styles>

function DropzonePlaceholder(props: Props) {
  const { classes } = props

  return (
    <Fade in >
      <div className={ classes.root } >
        <div className={ classes.inner } >
          <CloudIcon className={ classes.icon } />
          <Typography variant="display1" className={ classes.text } >
            Lâcher pour ajouter au dossier courant
          </Typography>
        </div>
      </div>
    </Fade>
  )
}

export default withStyles(styles)(DropzonePlaceholder)
