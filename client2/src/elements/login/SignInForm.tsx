import * as React from 'react'
import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import { Typography } from '@material-ui/core'

import { ApiError } from '../../models/ApiError'

const styles = (theme: Theme) => createStyles({
  signInForm: {
    padding: theme.spacing.unit * 3,
    flex: 1
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    display: 'flex'
  },
  signInButtons: {
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
  }
})

interface Props {
  error?: ApiError
  onSignUp: () => void
  onSignIn: (login: string, password: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  login: string
  password: string
}

class SignInForm extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { login: '', password: '' }
  }

  onSignUp() {
    this.props.onSignUp()
  }

  onSignIn() {
    // TODO check that each field is here
    this.props.onSignIn(this.state.login, this.state.password)
  }

  onLoginChange(login: string) {
    this.setState({ ...this.state, login })
  }

  onPasswordChange(password: string) {
    this.setState({ ...this.state, password })
  }

  render() {
    const { classes, error } = this.props

    return (
      <Grow in={true}>
        <div>
          <div className={classes.signInForm}>
            <TextField
              id="login-input"
              label="Login"
              className={classes.textField}
              type="text"
              margin="normal"
              onChange={(e) => this.onLoginChange(e.target.value)}
              error={!!error}
            />
            <TextField
              id="password-input"
              label="Mot de passe"
              className={classes.textField}
              type="password"
              margin="normal"
              onChange={(e) => this.onPasswordChange(e.target.value)}
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
          <div className={classes.signInButtons} >
            <Button color="primary" onClick={() => this.onSignUp()}>
              S'inscrire
            </Button>
            <Button color="primary" onClick={() => this.onSignIn()}>
              Se connecter
            </Button>
          </div>
        </div>
      </Grow>
    )
  }
}

export default withStyles(styles)<PropsWithStyle> (SignInForm)
