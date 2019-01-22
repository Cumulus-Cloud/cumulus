import  React from 'react'
import Grow from '@material-ui/core/Grow'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import MailIcon from '@material-ui/icons/Mail'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import { Typography } from '@material-ui/core'


const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing.unit * 3,
    display: 'flex',
    flexFlow: 'column',
    alignContent: 'center'
  },
  logo: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2,
    textAlign: 'center',
    fontSize: theme.typography.pxToRem(28)
  }
})


type PropsWithStyle = WithStyles<typeof styles>


function SignInForm({ classes }: PropsWithStyle) {
  return (
    <Grow in={true}>
      <div className={classes.root}>
        <Typography variant="body1">
          Un email de confirmation vient de vous être envoyé 🎉<br/><br/>
          Vous devez valider votre adresse email afin de pouvoir commencer à utiliser votre compte.
        </Typography>
        <div className={classes.logo}>
          <MailIcon color="secondary"/>
        </div>
      </div>
    </Grow>
  )
}

export default withStyles(styles)(SignInForm)
