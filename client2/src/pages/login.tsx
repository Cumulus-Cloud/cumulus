import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
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
  loginForm: {
    padding: theme.spacing.unit * 3,
    flex: 1
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    display: 'flex'
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
  loginPanel: {
    zIndex: 10
  }
})

interface Props {
  fullScreen: boolean
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

  render() {
    // TODO handler sign-up with account creation
    // TODO also handle email-validation (special url?)
    return (
      <div className={this.props.classes.background} >
        <div className={this.props.classes.backgroundFilter} />
        <Grow in={true} style={{ transitionDelay: 400 }} >
          <Paper className={this.props.classes.loginRoot} elevation={5}>
            <div className={this.props.classes.loginTitle}>
              <Zoom in={true} style={{ transitionDelay: 600 }} >
                <Button variant="fab"  className={this.props.classes.logo} >
                  <CloudIcon/>
                </Button>
              </Zoom>
              <Typography variant="headline" component="h3" className={this.props.classes.logoText}>
                Cumulus
              </Typography>
            </div>
            {
              this.state.showSignIn ?
              <SignUpForm onGoBack={() => this.toggleSignInForm()} onSignUp={() => console.log('sign up')} /> :
              <SignInForm onSignUp={() => this.toggleSignInForm()} onSignIn={() => console.log('sign in')} />
            }
          </Paper>
        </Grow>
      </div>
    )
  }
}

export default withRoot(withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ()(Login)))
