import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import * as React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Divider from '@material-ui/core/Divider'
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CloudUpload from '@material-ui/icons/CloudUpload'
import CloudIcon from '@material-ui/icons/CloudQueue'
import SearchIcon from '@material-ui/icons/Search'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import MailIcon from '@material-ui/icons/Mail'
import DeleteIcon from '@material-ui/icons/Delete'
import MenuButton from '@material-ui/icons/Menu'
import LeftButton from '@material-ui/icons/KeyboardArrowLeft'
import GroupAddIcon from '@material-ui/icons/GroupAdd'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import withMobileDialog, { WithMobileDialogOptions } from '@material-ui/core/withMobileDialog'

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

import Menu from '@material-ui/core/Menu';
import Grow from '@material-ui/core/Grow';
import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip'

import withRoot from '../withRoot'
import FileListElement from '../elements/FileListElement'
import CumulusAppBar from '../elements/CumulusAppBar';
import { User } from '../models/User';
import BreadCrumb from '../elements/BreadCrumb';
import CumulusDrawer from '../elements/CumulusDrawer';

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
