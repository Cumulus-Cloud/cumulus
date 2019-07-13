import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  button: {
    textTransform: 'none',
    fontWeight: 'normal'
  },
  icon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginRight: theme.spacing()
  },
  header: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  contentIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing() * 2
  },
  contentDescription: {
    margin: 0,
    flex: 4,
    padding: theme.spacing() * 2,
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
    padding: theme.spacing() * 2
  },
  contentType: {
    flex: 2,
    padding: theme.spacing() * 2,
    display: 'flex'
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
    marginTop: theme.spacing() * 5
  },
  loaderSpinner: {
    display: 'block',
    marginRight: theme.spacing(),
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
