import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
    minWidth: 0,
    display: 'flex'
  },
  dropzoneWrapper: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  loaderContent: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  },
  header: {
    display: 'flex'
  },
  breadCrumb: {
    flex: 1,
    width: 100,
    overflow: 'auto'
  },
  contentWrapper: {
    width: '100%',
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    flex: 1,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    }
  },
  searchBar: {
    // TODO
    marginRight: 24
  },
  errorContent: {
    flex: 1,
    alignContent: 'center'
  },
  errorButton: {
    display: 'flex',
    margin: 'auto',
    textDecoration: 'none'
  },
  content: {
    display: 'flex',
    flex: 1
  },
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
  },
  emptyDirectory: {
    display: 'flex',
    flex: 1,
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.grey[600]
  },
  emptyDirectoryIcon: {
    marginRight: theme.spacing.unit
  },
  avatar: {
    margin: 10,
    cursor: 'pointer'
  }
})

export default styles
