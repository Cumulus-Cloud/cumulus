import * as React from 'react'
import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'

import { ApiError } from 'models/ApiError'

import { connect, withStore } from 'store/store'
import { signInUser } from 'store/actions/authentication'

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

interface ContextProps {
  loading: boolean
  error?: ApiError
  onSignUp: () => void
  onSignIn: (login: string, password: string) => void
}

type PropsWithStyle = ContextProps & WithStyles<typeof styles>

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

  onSignIn(e: React.FormEvent) {
    e.preventDefault()
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
    const { classes, error, loading } = this.props

    return (
      <Grow in={true}>
        <form onSubmit={(e) => this.onSignIn(e)} >
          <div className={classes.root}>
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
          <div className={classes.buttons} >
            <Button color="primary" disabled={loading} onClick={() => this.onSignUp()}>
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
}

const mappedProps =
  connect((state, dispatch) => ({
    loading: state.signIn.loading,
    error: state.signIn.error,
    onSignUp: () => state.router.push('/auth/sign-up'),
    onSignIn: (login: string, password: string) => dispatch(signInUser({ login, password }))
  }))

export default withStore(withStyles(styles)<PropsWithStyle> (SignInForm), mappedProps)
