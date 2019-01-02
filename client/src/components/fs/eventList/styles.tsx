import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  button: {
    textTransform: 'none',
    fontWeight: 'normal'
  },
  icon: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  header: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  contentDescription: {
    margin: 0,
    flex: 4,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  },
  contentDescriptionValue: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  contentCreation: {
    flex: 2,
    padding: theme.spacing.unit * 2
  },
  contentType: {
    flex: 1,
    padding: theme.spacing.unit * 2
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
  loader: {
    margin: 'auto',
    display: 'block',
    marginTop: theme.spacing.unit * 5
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
