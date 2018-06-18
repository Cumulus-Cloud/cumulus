import * as React from 'react'
import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import MailIcon from '@material-ui/icons/Mail'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Zoom from '@material-ui/core/Zoom'
import CloudIcon from '@material-ui/icons/CloudQueue'
import { BrowserRouter as Router, Route, Link, match } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import * as H from 'history'

import SignInForm from '../elements/login/SignInForm'
import SignUpForm from '../elements/login/SignUpForm'
import withRoot from '../elements/utils/withRoot'
import { ApiError } from '../models/ApiError'
import { User } from '../models/User'


const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: '100%'
    }
  },
  loginPanel: {
    zIndex: 10,
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: '100%'
    }
  },
  loginTitle: {
    color: 'white',
    backgroundColor: '#29A7A0',
    padding: theme.spacing.unit * 3,
    display: 'flex'
  },
  logo: {
    backgroundColor: '#F1FBFA',
    color: '#29A7A0',
    marginRight: theme.spacing.unit * 2
  },
  logoText: {
    color: '#F1FBFA',
    paddingTop: theme.spacing.unit,
    fontSize: theme.typography.pxToRem(28)
  },
  emailPanel: {
    padding: theme.spacing.unit * 3,
    display: 'flex',
    flexFlow: 'column',
    alignContent: 'center'
  },
  emailLogo: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2,
    textAlign: 'center',
    fontSize: theme.typography.pxToRem(28)
  }
})

interface Props {
  signIn: {
    error?: ApiError
    user?: User
  }
  signUp: {
    error?: ApiError
    user?: User
  }
  showLoader: boolean
  onSignIn: (login: string, password: string) => void
  onSignUp: (login: string, email: string, password: string) => void

  history: H.History
  location: H.Location
  match: match<{}>
  staticContext: undefined
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  showSignIn: boolean
}

class Login extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { showSignIn: false }
  }

  toggleSignInForm() {
    this.setState({ ...this.state, showSignIn: !this.state.showSignIn })
  }

  onSignIn(login: string, password: string) {
    this.props.onSignIn(login, password)
  }

  onSignUp(login: string, email: string, password: string) {
    this.props.onSignUp(login, email, password)
  }

  render() {
    const { classes, signIn, signUp } = this.props

    const signInForm = (
      <SignInForm
        error={signIn.error}
        onSignUp={() => this.props.history.push('/auth/sign-up')}
        onSignIn={(login, password) => this.onSignIn(login, password)}
      />
    )
    
    const signUpForm = (
      <SignUpForm
        error={signUp.error}
        onGoBack={() => this.props.history.push('/auth/sign-in')}
        onSignUp={(login, email, password) => this.onSignUp(login, email, password)}
      />
    )
    
    const emailValidation = (
      <Grow in={true}>
        <div className={classes.emailPanel}>
          <Typography variant="body1">
            Un email de confirmation vient de vous être envoyé 🎉<br/><br/>
            Vous devez valider votre adresse email afin de pouvoir commencer à utiliser votre compte.
          </Typography>
          <div className={classes.emailLogo}>
            <MailIcon color="secondary"/>
          </div>
        </div>
      </Grow>
    )

    return (
      <div className={classes.root}>
        <Grow in={true} style={{ transitionDelay: 400 }} >
          <Paper className={classes.loginPanel} elevation={5}>
            <div className={classes.loginTitle}>
              <Zoom in={true} style={{ transitionDelay: 600 }} >
                <Button variant="fab" className={classes.logo} >
                  <CloudIcon/>
                </Button>
              </Zoom>
              <Typography variant="headline" component="h3" className={classes.logoText}>
                Cumulus
              </Typography>
            </div>
            <Route exact path="/auth/sign-in" render={() => signInForm}/>
            <Route exact path="/auth/sign-up" render={() => signUpForm}/>
            <Route exact path="/auth/email-validation" render={() => emailValidation}/>
          </Paper>
        </Grow>
      </div>
    )

  }
}

export default withRoot(withStyles(styles) <PropsWithStyle> (Login))
