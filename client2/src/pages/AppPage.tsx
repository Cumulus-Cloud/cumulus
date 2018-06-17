import { Theme, Direction } from '@material-ui/core/styles/createMuiTheme'
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
import InfoIcon from '@material-ui/icons/Info'
import ListItemText from '@material-ui/core/ListItemText'
import CloudUpload from '@material-ui/icons/CloudUpload'
import CloudIcon from '@material-ui/icons/CloudQueue'
import Slide from '@material-ui/core/Slide'
import SearchIcon from '@material-ui/icons/Search'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import MailIcon from '@material-ui/icons/Mail'
import DeleteIcon from '@material-ui/icons/Delete'
import ShareIcon from '@material-ui/icons/Share'
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
import CircularProgress from '@material-ui/core/CircularProgress'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import withMobileDialog, { WithMobileDialogOptions } from '@material-ui/core/withMobileDialog'

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import withRoot from '../elements/utils/withRoot'
import FileListElement from '../elements/FileListElement'
import CumulusAppBar from '../elements/CumulusAppBar';
import { User } from '../models/User';
import BreadCrumb from '../elements/BreadCrumb';
import CumulusDrawer from '../elements/CumulusDrawer';
import { Grow } from '@material-ui/core';
import { Directory } from '../models/FsNode';


const Home = () => (
<div>
    <h2>Home</h2>
    <Link to="/about">
        About
    </Link>
</div>
)
  
const About = () => (
<div>
    <h2>About</h2>
    <Link to="/">
        Go back
    </Link>
</div>
)

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100%'
  },
  testRoot: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    maxWidth: 800,
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  heading: {
    paddingLeft: 15,
    paddingTop: 2,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  drawerPaper: {
    position: 'relative',
    width: 240,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 4, // +1 for the scrollbar
    marginTop: theme.mixins.toolbar.minHeight,
    minWidth: 0,
    overflowY: 'scroll',
    ['&::-webkit-scrollbar']: {
      width: theme.spacing.unit
    },
    ['&::-webkit-scrollbar-track']: {
      background: theme.palette.background.paper
    },
    ['&::-webkit-scrollbar-thumb']: {
      background: '#CCC'
    },
    ['&::-webkit-scrollbar-thumb:hover']: {
      background: '#BBB'
    }
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  emptyDirectory: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDirectoryIcon: {
    marginRight: theme.spacing.unit
  },
  toolbar: theme.mixins.toolbar,
  margin: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.primary.light,
    color: 'white'
  },
  drawerStatic: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  }
})

interface Props {
  onChangePath: (path: string, contentOffset: number) => void
  currentDirectory: Directory
  showLoader: boolean
  fullScreen: boolean
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  popupOpened: boolean
  drawer: boolean
  anchorEl?: EventTarget
}

class AppPage extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  componentDidMount() {
    this.props.onChangePath('/', 0) // TODO handle pagination
  }

  onChangePath(path: string) {
    this.props.onChangePath(path, 0) // TODO handle pagination
  }

  showPopup() {
    this.setState({...this.state, popupOpened: !this.state.popupOpened })
  }

  drawerToggle() {
    this.setState({...this.state, drawer: !this.state.drawer })
  }

  openMenu(e: EventTarget) {
    this.setState({...this.state, anchorEl: e })
  }

  closeMenu() {
    this.setState({...this.state, anchorEl: undefined })
  }

  render() {
    const { currentDirectory, showLoader, classes, fullScreen } = this.props

    const user: User = {
      id: '1',
      login: 'Vuzi',
      creation: "",
      roles: [ 'user', 'admin' ]
    }

    // TODO
    // Drawer (with SwipeableDrawer + Static drawer) + Search etc...
    // Content + FileListElement
    // Login page ?

    const searchElements = searchListItem
    const actionElements = (
      <div>
        <ListItem button onClick={() => this.showPopup()} >
          <ListItemIcon>
            <CreateNewFolderIcon />
          </ListItemIcon>
          <ListItemText primary="Create Directory" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <CloudUpload />
          </ListItemIcon>
          <ListItemText primary="Upload File" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Share Directory" />
        </ListItem>
      </div>
    )
    const contextualActionElements = otherMailFolderListItems

    const breadCrumb = currentDirectory && currentDirectory.path !== '/' ? // Do not show for an empty path (root directory)
      <BreadCrumb path={currentDirectory.path} onPathSelected={(path) => this.onChangePath(path)} /> :
      <span/>

    const fileList = currentDirectory && !showLoader ?
      currentDirectory.content.map((node) => (
        <FileListElement
          key={node.id}
          fsNode={node}
          selected={false}
          onSelected={() => console.log('select')}
          onDeselected={() => console.log('select')}
          onClicked={() => this.onChangePath(node.path)}
        />
      )) :
      []

    return (
      <Grow in={true}>
        <div className={classes.root}>
          <CumulusAppBar 
            user={user}
            showDrawer={() => this.drawerToggle()}
            showAccountPanel={() => { return }}
            showAdminPanel={() => { return }}
            logout={() => { return }}
          />
          <CumulusDrawer
            onDrawerToggle={() => this.drawerToggle()}
            showDynamicDrawer={this.state.drawer}
            searchElements={searchElements}
            actionElements={actionElements}
            contextualActionElements={contextualActionElements}
          />
          <main className={classes.content}>
              <span>
                {breadCrumb}
                <div className={classes.testRoot}>
                  {
                    showLoader ?
                    <div>
                      <CircularProgress className={classes.loader} size={100} color="primary"/>
                    </div> :
                    <Slide direction="up" in={true}>
                      <div>
                        {
                          fileList.length == 0 ?
                          <Typography variant="caption" className={classes.emptyDirectory} >
                            <InfoIcon className={classes.emptyDirectoryIcon}/>
                            {'Ce dossier est vide'} 
                          </Typography> :
                          fileList
                        }
                      </div>
                    </Slide>
                  }
                </div>
              </span>
          </main>

          <Dialog
            fullScreen={fullScreen}
            open={this.state.popupOpened}
            onClose={() => this.showPopup()}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogTitle id="responsive-dialog-title">
              Creation of a new directory
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Name of the new directory
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                type="text"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.showPopup()}>
                Cancel
              </Button>
              <Button onClick={() => this.showPopup()} color="primary" autoFocus>
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </div>  

      </Grow>
    )
  }
}

export default withRoot(withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ()(AppPage)))

// TODO..
const searchListItem = (
  <div>
    <ListItem button style={{ height: 50 }}>
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
      <ListItem>
        <TextField
          id="search"
          type="search"
          margin="none"
          placeholder="Search..."
          style={{
            marginBottom: 0,
            marginLeft: -9,
            width: 136
          }}

          InputProps={{
            disableUnderline: true
          }}
        />
      </ListItem>
    </ListItem>
  </div>
);

const mailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <CreateNewFolderIcon />
      </ListItemIcon>
      <ListItemText primary="Create Directory" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <CloudUpload />
      </ListItemIcon>
      <ListItemText primary="Upload File" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ShareIcon />
      </ListItemIcon>
      <ListItemText primary="Share Directory" />
    </ListItem>
  </div>
);

const otherMailFolderListItems = (
  <div>
    <ListItem button disabled>
      <ListItemIcon>
        <CompareArrowsIcon />
      </ListItemIcon>
      <ListItemText primary="Move selected" />
    </ListItem>
    <ListItem button disabled>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary="Delete selected" />
    </ListItem>
    <ListItem button disabled >
      <ListItemIcon>
        <ShareIcon />
      </ListItemIcon>
      <ListItemText primary="Share selected" />
    </ListItem>
  </div>
);