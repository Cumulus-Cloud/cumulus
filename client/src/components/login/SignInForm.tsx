import  React from 'react'
import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'

import { useSignIn, useRouting } from 'store/store'


const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing.unit * 3,
    flex: 1
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    display: 'flex'
  },
  buttons: {
    padding: theme.spacing.unit * 3,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  errorMessage: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * -3,
    height: theme.typography.body1.lineHeight,
    textAlign: 'center'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
})


type PropsWithStyle = WithStyles<typeof styles>

function SignInForm(props: PropsWithStyle) {

  const [login, setLogin] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { loading, error, signInUser } = useSignIn()
  const { showSignUp } = useRouting()

  const { classes } = props

  const onSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO check that each field is here
    signInUser(login, password)
  }

  return (
    <Grow in={true}>
      <form onSubmit={onSignIn} >
        <div className={classes.root}>
          <TextField
            id="login-input"
            label="Login"
            className={classes.textField}
            type="text"
            margin="normal"
            onChange={(e) => setLogin(e.target.value)}
            error={!!error}
          />
          <TextField
            id="password-input"
            label="Mot de passe"
            className={classes.textField}
            type="password"
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
          />
          <Typography color="error" variant="body1" className={classes.errorMessage} >
            {
              error ?
              <Grow in={true}>
                <span>
                  {error.message /* TODO key + i18n */ }
                </span>
              </Grow> :
              <span/>
            }
          </Typography>
        </div>
        <div className={classes.buttons} >
          <Button color="primary" disabled={loading} onClick={() => showSignUp()}>
            S'inscrire
          </Button>
          <Button color="primary" disabled={loading} type="submit">
            Se connecter
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      </form>
    </Grow>
  )

}

export default withStyles(styles)(SignInForm)
