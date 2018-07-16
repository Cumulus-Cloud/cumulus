import { Theme, Direction } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import * as React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CloudUpload from '@material-ui/icons/CloudUpload'
import SearchIcon from '@material-ui/icons/Search'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import DeleteIcon from '@material-ui/icons/Delete'
import ShareIcon from '@material-ui/icons/Share'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import TextField from '@material-ui/core/TextField'
import withMobileDialog, { WithMobileDialogOptions } from '@material-ui/core/withMobileDialog'
import { Route, Redirect, match, RouteComponentProps, Switch } from 'react-router-dom'

import withRoot from '../elements/utils/withRoot'
import CumulusAppBar from '../elements/CumulusAppBar'
import { User } from '../models/User'
import CumulusDrawer from '../elements/CumulusDrawer'
import { Grow } from '@material-ui/core'
import CreationPopupContainer from '../elements/fs/creation/CreationPopupContainer'
import Routes from '../services/routes'
import FilesListContainer from '../elements/fs/FilesListContainer'
import UploadPopupContainer from '../elements/fs/upload/UploadPopupContainer'
import UploadProgressPopupContainer from '../elements/fs/upload/UploadProgressPopupContainer'
import SnackbarsContainer from '../elements/notification/snackbarsContainer'


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
  showCreationPopup: () => void
  showUploadPopup: () => void
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

  showCreationPopup() {
    this.props.showCreationPopup()
  }

  showUploadPopup() {
    this.props.showUploadPopup()
  }

  toggleDrawer() {
    this.setState({...this.state, drawer: !this.state.drawer })
  }

  openMenu(e: EventTarget) {
    this.setState({...this.state, anchorEl: e })
  }

  closeMenu() {
    this.setState({...this.state, anchorEl: undefined })
  }

  render() {
    const { classes } = this.props

    // TODO real user
    const user: User = {
      id: '1',
      login: 'Vuzi',
      creation: "",
      roles: [ 'user', 'admin' ]
    }

    const searchElements = searchListItem
    const actionElements = (
      <div>
        <ListItem button onClick={() => this.showCreationPopup()} >
          <ListItemIcon>
            <CreateNewFolderIcon />
          </ListItemIcon>
          <ListItemText primary="Create Directory" />
        </ListItem>
        <ListItem button onClick={() => this.showUploadPopup()} >
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


    return (
      <Grow in={true}>
        <div className={classes.root}>
          <CumulusAppBar 
            user={user}
            showDrawer={() => this.toggleDrawer()}
            showAccountPanel={() => { return }}
            showAdminPanel={() => { return }}
            logout={() => { return }}
          />
          <CumulusDrawer
            onDrawerToggle={() => this.toggleDrawer()}
            showDynamicDrawer={this.state.drawer}
            searchElements={searchElements}
            actionElements={actionElements}
            contextualActionElements={contextualActionElements}
          />

          <Switch>
            <Route path={Routes.app.fs_matcher} render={(p: RouteComponentProps<{ path: string }>) => {
                return (
                  <FilesListContainer initialPath={p.match.params.path} />
                )
              }}/>
            <Route render={() => <Redirect to={`${Routes.app.fs}/`} />} />
          </Switch>

          <CreationPopupContainer />
          <UploadPopupContainer />

          <UploadProgressPopupContainer />

          <SnackbarsContainer />

        </div>

      </Grow>
    )
  }
}
  /*
  <Route path={Routes.app.createDirectory} render={() => <CreationPopupContainer open={true} />}/>
  <Route path={Routes.app.fs} render={() => <h1>{"hello"}</h1>}/>
  */

export default withRoot(withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ({ breakpoint: 'xs' })(AppPage)))

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