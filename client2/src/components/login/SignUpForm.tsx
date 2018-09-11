import * as React from 'react'
import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import LeftButton from '@material-ui/icons/KeyboardArrowLeft'
import Visibility from '@material-ui/icons/Visibility'
import CircularProgress from '@material-ui/core/CircularProgress'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import { signUpUser } from 'store/actions/authentication'
import { connect, withStore } from 'store/store'

import { ApiError } from 'models/ApiError'


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
  backButton: {
    marginRight: 'auto',
    paddingLeft: 0
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
  onSignIn:() => void
  onSignUp:(login: string, email: string, password: string) => void
}

type PropsWithStyle = ContextProps & WithStyles<typeof styles>

interface State {
  showPassword: boolean
  login: string
  email: string
  password: string
}

class SignUpForm extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { 
      login: '',
      email: '',
      password: '',
      showPassword: false
    }
  }

  onSignIn() {
    this.props.onSignIn()
  }

  onSignUp(e: React.FormEvent) {
    e.preventDefault()
    // TODO check values ?
    this.props.onSignUp(this.state.login, this.state.email, this.state.password)
  }

  togglePassword() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  onLoginChange(login: string) {
    this.setState({ ...this.state, login })
  }

  onEmailChange(email: string) {
    this.setState({ ...this.state, email })
  }

  onPasswordChange(password: string) {
    this.setState({ ...this.state, password })
  }

  render() {

    const { classes, error, loading } = this.props
    
    return (
      <Grow in={true}>
        <form onSubmit={(e) => this.onSignUp(e)} >
          <div className={classes.root}>
            <Typography variant="display1" align="center" >
              Inscription
            </Typography>
            <Tooltip id="tooltip-icon" title="Nom unique du compte" placement="bottom" enterDelay={500} >
              <TextField
                id="login-input"
                label="Login"
                className={classes.textField}
                type="text"
                margin="normal"
                onChange={(e) => this.onLoginChange(e.target.value)}
                error={!!error}
              />
            </Tooltip>
            <Tooltip id="tooltip-icon" title="Email valide lié au compte" placement="bottom" enterDelay={500} >
              <TextField
                id="login-email"
                label="Adresse email"
                className={classes.textField}
                type="email"
                margin="normal"
                onChange={(e) => this.onEmailChange(e.target.value)}
                error={!!error}
              />
            </Tooltip>
            <Tooltip id="tooltip-icon" title="Clef secrète de chiffrement, entre 4 et 64 caractères" placement="bottom" enterDelay={500} >
              <TextField
                id="password-input"
                label="Mot de passe"
                className={classes.textField}
                type={this.state.showPassword ? 'text' : 'password'}
                margin="normal"
                onChange={(e) => this.onPasswordChange(e.target.value)}
                error={!!error}

                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={() => this.togglePassword()}
                        onMouseDown={(e) => e.preventDefault}
                      >
                        {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Tooltip>
          </div>
          <div className={classes.buttons} >
            <Button color="primary" disabled={loading} className={classes.backButton} onClick={() => this.onSignIn()} >
              <LeftButton />
              Revenir à la connexion
            </Button>
            <Button color="primary" disabled={loading} type="submit" >
              S'inscrire
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
    loading: state.signUp.loading,
    error: state.signUp.error,
    onSignIn: () => state.router.push('/auth/sign-in'),
    onSignUp: (login: string, email: string, password: string) => dispatch(signUpUser({ login, email, password }))
  }))

export default withStore(withStyles(styles)<PropsWithStyle> (SignUpForm), mappedProps)
