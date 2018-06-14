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
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import * as React from 'react'


const styles = (theme: Theme) => createStyles({
  form: {
    padding: theme.spacing.unit * 3,
    flex: 1
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    display: 'flex'
  },
  formButtons: {
    padding: theme.spacing.unit * 3,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  backButton: {
    marginRight: 'auto',
    paddingLeft: 0
  }
})

interface Props {
  onGoBack:() => void
  onSignUp:(login: string, email:string, password: string) => void
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  showPassword: boolean
}

class SignUpForm extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { 
      showPassword: false
    }
  }

  onGoBack() {
    this.props.onGoBack()
  }

  onSignUp() {
    // TODO check values ?
    this.props.onSignUp('todo', 'todo', 'todo')
  }

  togglePassword() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    return (
      <Grow in={true}>
        <div>
          <div className={this.props.classes.form}>
            <Typography variant="display1" align="center" >
              Inscription
            </Typography>
            <Tooltip id="tooltip-icon" title="Nom unique du compte" placement="bottom-end" enterDelay={500} >
              <TextField
                id="login-input"
                label="Login"
                className={this.props.classes.textField}
                type="text"
                margin="normal"
              />
            </Tooltip>
            <Tooltip id="tooltip-icon" title="Email valide lié au compte" placement="bottom-end" enterDelay={500} >
              <TextField
                id="login-email"
                label="Adresse email"
                className={this.props.classes.textField}
                type="email"
                margin="normal"
              />
            </Tooltip>
            <Tooltip id="tooltip-icon" title="Clef secrète de chiffrement, entre 4 et 64 caractères" placement="bottom-end" enterDelay={500} >
              <TextField
                id="password-input"
                label="Mot de passe"
                className={this.props.classes.textField}
                type={this.state.showPassword ? 'text' : 'password'}
                margin="normal"

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
          <div className={this.props.classes.formButtons} >
            <Button color="primary" className={this.props.classes.backButton} onClick={() => this.onGoBack()} >
              <LeftButton />
              Revenir à la connexion
            </Button>
            <Button color="primary" onClick={() => this.onSignUp()} >
              S'inscrire
            </Button>
          </div>
        </div>
      </Grow>
    )
  }
}

export default withStyles(styles)<PropsWithStyle> (SignUpForm)
