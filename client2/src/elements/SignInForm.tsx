import Button from '@material-ui/core/Button'
import Grow from '@material-ui/core/Grow'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import TextField from '@material-ui/core/TextField'
import * as React from 'react'

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
  }
})

interface Props {
  onSignUp: (login: string, password: string) => void
  onSignIn: () => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {}

class SignInForm extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  onSignUp() {
    this.props.onSignUp('todo', 'todo')
  }

  onSignIn() {
    this.props.onSignIn()
  }

  render() {
    return (
      <Grow in={true}>
        <div>
          <div className={this.props.classes.signInForm}>
            <TextField
              id="login-input"
              label="Login"
              className={this.props.classes.textField}
              type="text"
              margin="normal"
            />
            <TextField
              id="password-input"
              label="Mot de passe"
              className={this.props.classes.textField}
              type="password"
              margin="normal"
            />
          </div>
          <div className={this.props.classes.signInButtons} >
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
