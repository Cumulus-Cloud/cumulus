import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import MailIcon from '@material-ui/icons/Mail'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Zoom from '@material-ui/core/Zoom'
import CloudIcon from '@material-ui/icons/CloudQueue'
import * as React from 'react'

import SignInForm from '../elements/SignInForm'
import SignUpForm from '../elements/SignUpForm'
import withRoot from '../withRoot'
import { ApiError } from '../models/ApiError';
import { User } from '../models/User';


const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing.unit * 3,
    flex: 1
  },
  loginRoot: {
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
  backgroundFilter: {
    zIndex: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(ellipse at center, #1e5799 0%,rgba(54, 151, 142, 0.8) 0%,#0C526C 100%,#3d7eaa 100%,#182848 100%,#6e48aa 100%,#6e48aa 100%)',
    opacity: .7
  },
  background: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(https://cumulus-cloud.github.io/assets/img/template/bg3.jpg)',
    backgroundSize: 'cover'
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
  onSignIn: (login: string, password: string) => void
  onSignUp: (login: string, email: string, password: string) => void
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
    const isSignedIn = !!signIn.user
    const hasSignedUp = !!signUp.user

    console.log(this.props)

    const { showSignIn } = this.state

    const form = (() => {
      if(hasSignedUp) {
        // Has signed up, show the email confirmation panel
        return (
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
      } else if(showSignIn) {
        // Is signing up, show the sign up panel
        return <SignUpForm error={signUp.error} createdUser={signUp.user} onGoBack={() => this.toggleSignInForm()} onSignUp={(login, email, password) => this.onSignUp(login, email, password)} /> :
      } else {
        // Default, show the sign in panel
        return <SignInForm error={signIn.error} onSignUp={() => this.toggleSignInForm()} onSignIn={(login, password) => this.onSignIn(login, password)} />
      }
    })()

    const content = (
      <Grow in={true} style={{ transitionDelay: 400 }} >
        <Paper className={classes.loginRoot} elevation={5}>
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
          {form}
        </Paper>
      </Grow>
    )

    return (
      <div className={classes.background} >
        <div className={classes.backgroundFilter} />
        {
          // When signed in, show the backgrond
          !isSignedIn ?
          content :
          <span/>
        }
      </div>
    )
  }
}

export default withRoot(withStyles(styles) <PropsWithStyle> (Login))
