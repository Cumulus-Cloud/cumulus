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

import Menu from '@material-ui/core/Menu';
import Grow from '@material-ui/core/Grow';
import Zoom from '@material-ui/core/Zoom';
import MenuItem from '@material-ui/core/MenuItem';

import withRoot from '../withRoot'
import FileListElement from '../elements/FileListElement'
import CumulusAppBar from '../elements/CumulusAppBar';
import { User } from '../models/User';
import BreadCrumb from '../elements/BreadCrumb';
import CumulusDrawer from '../elements/CumulusDrawer';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing.unit * 3,
    flex: 1
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
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    display: 'flex'
  },
  title: {
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
  loginButtons: {
    padding: theme.spacing.unit * 3,
    display: 'flex',
    justifyContent: 'flex-end'
  }
})

interface Props {
  fullScreen: boolean
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  popupOpened: boolean
  drawer: boolean
  anchorEl?: EventTarget
}

class Login extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  render() {
    // TODO handler sign-up with account creation
    // TODO also handle email-validation (special url?)
    return (
      <div className={this.props.classes.background} >
        <div className={this.props.classes.backgroundFilter} />
        <Grow in={true} style={{ transitionDelay: 300 }} >
          <Paper className={this.props.classes.loginPanel} elevation={5}>
            <div className={this.props.classes.title}>
              <Button variant="fab"  className={this.props.classes.logo} >
                <CloudIcon/>
              </Button>
              <Typography variant="headline" component="h3" className={this.props.classes.logoText}>
                Cumulus
              </Typography>
            </div>
            <div className={this.props.classes.root}>
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
            <div className={this.props.classes.loginButtons} >
              <Button color="primary">
                S'inscrire
              </Button>
              <Button color="primary">
                Se connecter
              </Button>
            </div>
          </Paper>
        </Grow>
      </div>
    )
  }
}

export default withRoot(withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ()(Login)))
