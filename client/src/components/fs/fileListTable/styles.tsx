import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    boxShadow: 'none',
    borderTop: 0,
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    transform: 'none',
    flex: 1
  },
  contentTableHead: {
    zIndex: 99,
    boxShadow: 'none',
    backgroundColor: 'white',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: 0
  },
  contentTableBody: {
    flex: 1,
    display: 'flex'
  },
  contentTypeIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit
  },
  contentCheck: {
    marginRight: '-6px',
    zIndex: 9 // Fix checkbox passing through header
  },
  contentName: {
    margin: 0,
    flex: 4,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  },
  contentNameValue: {
    whiteSpace: 'nowrap',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  contentModification: {
    flex: 2,
    padding: theme.spacing.unit * 2
  },
  contentSize: {
    flex: 1,
    padding: theme.spacing.unit * 2
  },
  contentSelected: {
    color: theme.palette.primary.light
  },
  contentHeadRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    height: '45px',
    alignItems: 'center',
    paddingRight: '61px' // Let space for the menu icon
  },
  contentRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
    height: '45px',
    alignItems: 'center',
    ['&:hover'] : {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  contentRowSelected: {
    backgroundColor: 'rgba(41, 167, 160, 0.08)',
    color: theme.palette.primary.light,
    ['&:hover'] : {
      backgroundColor: 'rgba(41, 167, 160, 0.18)'
    }
  },
  rowLoadMore: {
    width: '100%',
    height: '100%',
    borderRadius: 0
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderSpinner: {
    display: 'block',
    marginRight: theme.spacing.unit,
    marginBottom: 0
  },
  loaderText: {
    display: 'flex',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default styles
