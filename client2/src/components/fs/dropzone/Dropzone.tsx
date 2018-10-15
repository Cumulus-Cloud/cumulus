import  React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import CloudIcon from '@material-ui/icons/CloudUpload'
import Fade from '@material-ui/core/Fade'

import styles from './styles'


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
