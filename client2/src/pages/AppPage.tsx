import  React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import Grow from '@material-ui/core/Grow'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
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
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { Route, Redirect, Switch } from 'react-router-dom'

import CumulusDrawer from 'components/CumulusDrawer'
import CreationPopup from 'components/fs/creation/CreationPopup'
import FileList from 'components/fs/list/FileList'
import UploadPopup from 'components/fs/upload/UploadPopup'
import UploadProgressPopup from 'components/fs/upload/UploadProgressPopup'
import Snackbars from 'components/notification/Snackbars'
import DetailPopup from 'components/fs/detail/DetailPopup'

import { User } from 'models/User'
import { FsNode } from 'models/FsNode'

import { togglePopup } from 'utils/popup'

import { withStore } from 'store/store'

import Routes from 'services/routes'

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100%'
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
  selection: FsNode[]
  user: User
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

  forceDrawer(state: boolean) {
    this.setState({...this.state, drawer: state })
  }

  openMenu(e: EventTarget) {
    this.setState({...this.state, anchorEl: e })
  }

  closeMenu() {
    this.setState({...this.state, anchorEl: undefined })
  }

  render() {
    const { selection, classes } = this.props

    const searchElements = (
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
    )

    const actionElements = (
      <div>
        <ListItem button onClick={() => {
          this.forceDrawer(false) // TODO fix focus stolen
          this.showCreationPopup()
        }} >
          <ListItemIcon>
            <CreateNewFolderIcon />
          </ListItemIcon>
          <ListItemText primary="Créer un dossier" />
        </ListItem>
        <ListItem button onClick={() => {
          this.forceDrawer(false) // TODO fix focus stolen
          this.showUploadPopup()
        }} >
          <ListItemIcon>
            <CloudUpload />
          </ListItemIcon>
          <ListItemText primary="Uploader un fichier" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Partager un dossier" />
        </ListItem>
      </div>
    )
    const contextualActionElements = (
      <div>
        <ListItem disableRipple button disabled={selection.length <= 0} style={{ paddingRight: '0px' }} >
          <ListItemText
            primary={
              selection.length <= 0 ? 'Aucun fichier selectionné' : (
                selection.length === 1 ? '1 fichier selectionné' :
                `${selection.length} fichiers selectionés`
              )
            }
          />
        </ListItem>
        <ListItem button disabled={selection.length <= 0}>
          <ListItemIcon>
            <CompareArrowsIcon />
          </ListItemIcon>
          <ListItemText primary="Déplacer la sélection" />
        </ListItem>
        <ListItem button disabled={selection.length <= 0}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Supprimer la sélection" />
        </ListItem>
        <ListItem button disabled={selection.length <= 0}>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Partager la sélection" />
        </ListItem>
      </div>
    )

    return (
      <Grow in={true} timeout={700} >
        <div className={classes.root}>
          <CumulusDrawer
            onDrawerToggle={() => this.toggleDrawer()}
            showDynamicDrawer={this.state.drawer}
            searchElements={searchElements}
            actionElements={actionElements}
            contextualActionElements={contextualActionElements}
          />

          <Switch>
            <Route path={Routes.app.fs_matcher} component={FileList}/>
            <Route render={() => <Redirect to={`${Routes.app.fs}/`} />} />
          </Switch>

          <CreationPopup/>
          <UploadPopup />
          <DetailPopup />
          <UploadProgressPopup />
          <Snackbars />

        </div>

      </Grow>
    )
  }
}


const AppPageWithStyle = withMobileDialog<Props> ({ breakpoint: 'xs' })(withStyles(styles) (AppPage))

const AppPageWithContext = withStore(AppPageWithStyle, state => {
  const selectedContent = state.fs.selectedContent
  const content = state.fs.content || []
  const selection = selectedContent.type === 'ALL' ? content : (selectedContent.type === 'NONE' ? [] : content.filter((node) => selectedContent.selectedElements.indexOf(node.id) >= 0))
  
  const user = state.auth.user

  if(!user) // Should not happend
    throw new Error('App page accessed without authentication')
  
  return {
    selection: selection,
    user: user,
    showCreationPopup: () => togglePopup('DIRECTORY_CREATION', true)(state.router), // TODO typed actions
    showUploadPopup: () => togglePopup('FILE_UPLOAD', true)(state.router)
  }
})

export default AppPageWithContext
