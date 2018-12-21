import  React from 'react'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Zoom from '@material-ui/core/Zoom'
import CloudIcon from '@material-ui/icons/CloudQueue'
import { Route, Redirect, match, Switch } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import  H from 'history'

import SignUpConfirmation from 'components/login/SignUpConfirmation'
import SignIn from 'components/login/SignInForm'
import SignUp from 'components/login/SignUpForm'
import { Fab } from '@material-ui/core'


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

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grow in={true} style={{ transitionDelay: 400 } as any} >
          <Paper className={classes.loginPanel} elevation={5}>
            <div className={classes.loginTitle}>
              <Zoom in={true} style={{ transitionDelay: 600 } as any} >
                <Fab className={classes.logo} >
                  <CloudIcon/>
                </Fab>
              </Zoom>
              <Typography variant="h5" component="h3" className={classes.logoText}>
                Cumulus
              </Typography>
            </div>
            <Switch>
              <Route exact path="/auth/sign-in" render={() => <SignIn/>}/>
              <Route exact path="/auth/sign-up" render={() => <SignUp/>}/>
              <Route exact path="/auth/sign-up-confirmation" render={() => <SignUpConfirmation/>}/>
              <Route render={() => <Redirect to="/auth/sign-in"/>}/>
            </Switch>
          </Paper>
        </Grow>
      </div>
    )

  }
}

export default withRouter(withStyles(styles)(Login))
