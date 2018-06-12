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
import MenuItem from '@material-ui/core/MenuItem';

import withRoot from '../withRoot'
import FileListElement from '../elements/FileListElement'
import CumulusAppBar from '../elements/CumulusAppBar';
import { User } from '../models/User';
import BreadCrumb from '../elements/BreadCrumb';

/*
import ButtonAppBar from '../components/app-bar'
import withRoot from '../withRoot'
import AnomalyList from './anomaly-list'
import AnomalyDetail from './anomaly-detail'
import ClientsList from './client-list'
*/


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
    paddingTop: theme.spacing.unit * 2,
    minWidth: 0
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
  fullScreen: boolean
}

type PropsWithStyle = Props & WithStyles<typeof styles>

interface State {
  popupOpened: boolean
  drawer: boolean
  anchorEl?: EventTarget
}

class Index extends React.Component<PropsWithStyle, State> {

  constructor(props: PropsWithStyle) {
    super(props)
    this.state = { popupOpened: false, drawer: false }
  }

  showPopup() {
    this.setState({...this.state, popupOpened: !this.state.popupOpened })
  }

  showDrawer() {
    this.setState({...this.state, drawer: !this.state.drawer })
  }

  openMenu(e: EventTarget) {
    this.setState({...this.state, anchorEl: e })
  }


  closeMenu() {
    this.setState({...this.state, anchorEl: undefined })
  }

  render() {
    const { fullScreen } = this.props;

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

    return (
      <Router>
        <div className={this.props.classes.root}>
          <CumulusAppBar 
            user={user}
            showDrawer={() => this.showDrawer()}
            showAccountPanel={() => { return }}
            showAdminPanel={() => { return }}
            logout={() => { return }}
          />
          <div>
          <SwipeableDrawer
            open={this.state.drawer}
            onClose={() => this.showDrawer()}
            onOpen={() => this.showDrawer()}
          >
              <List>{searchListItem}</List>
              <Divider style={{height: 1}} />
              <List>
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
                      <GroupAddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Share Directory" />
                  </ListItem>
                </div>
              </List>
              <Divider style={{height: 1}} />
              <List>{otherMailFolderListItems}</List>
          </SwipeableDrawer>
          <Drawer
            variant="permanent"
            className={this.props.classes.drawerStatic}
            classes={{
              paper: this.props.classes.drawerPaper,
            }}
          >
            <div className={this.props.classes.toolbar} />
            <List>{searchListItem}</List>
            <Divider style={{height: 1}} />
            <List>
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
                    <GroupAddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Share Directory" />
                </ListItem>
              </div>
            </List>
            <Divider style={{height: 1}} />
            <List>{otherMailFolderListItems}</List>
          </Drawer>
          </div>
          <main className={this.props.classes.content}>
            <div className={this.props.classes.toolbar} />
            <BreadCrumb path={'/aaaa/bbbb/cccc/dddd'} onPathSelected={(p) => console.log(p)} />

            <div className={this.props.classes.testRoot}>

              <FileListElement type="file" filename="test.jpg" />
              <FileListElement type="directory" filename="some_directory" />

              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Icon>insert_drive_file</Icon>
                  <Typography className={this.props.classes.heading}>some image.jpg</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                    sit amet blandit leo lobortis eget.
                  </Typography>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                  <Button size="small">Delete</Button>
                  <Button size="small">Move</Button>
                  <Button size="small" color="primary">Share</Button>
                  <Button size="small" color="primary">Download</Button>
                </ExpansionPanelActions>
              </ExpansionPanel>

              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Icon>insert_drive_file</Icon>
                  <Typography className={this.props.classes.heading}>things.pdf</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                    sit amet blandit leo lobortis eget.
                  </Typography>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Icon>folder</Icon>
                  <Typography className={this.props.classes.heading}>Some directory</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                    sit amet blandit leo lobortis eget.
                  </Typography>
                </ExpansionPanelDetails>
              </ExpansionPanel>

            </div>

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

      </Router>
    )
  }
}

export default withStyles(styles) <PropsWithStyle> (withMobileDialog<PropsWithStyle> ()(Index))

// export default withMobileDialog()(withStyles(styles) <PropsWithStyle> (Index))


//export default withRoot(withMobileDialog()(withStyles(styles) < {} > (Index)))

/*

  <div className={this.props.classes.root}>
    <Route exact path="/" component={Home}/>
    <Route exact path="/about" component={About}/>
  </div>

*/

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
        <GroupAddIcon />
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
        <GroupAddIcon />
      </ListItemIcon>
      <ListItemText primary="Share selected" />
    </ListItem>
  </div>
);

/*

          <Paper className={this.props.classes.tableRoot}>
            <Table className={this.props.classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Dessert (100g serving)</TableCell>
                  <TableCell numeric>Calories</TableCell>
                  <TableCell numeric>Fat (g)</TableCell>
                  <TableCell numeric>Carbs (g)</TableCell>
                  <TableCell numeric>Protein (g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(n => {
                  return (
                    <TableRow key={n.id}>
                      <TableCell component="th" scope="row">
                        {n.name}
                      </TableCell>
                      <TableCell numeric>{n.calories}</TableCell>
                      <TableCell numeric>{n.fat}</TableCell>
                      <TableCell numeric>{n.carbs}</TableCell>
                      <TableCell numeric>{n.protein}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <div>
            <Paper className={this.props.classes.pathRoot} elevation={4}>
              <Typography variant="headline" component="h3">
                This is a sheet of paper.
              </Typography>
              <Typography component="p">
                Paper can be used to build surface or other elements for your application.
              </Typography>
            </Paper>
          </div>

      */
