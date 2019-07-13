import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    maxWidth: 'inherit'
  },
  details: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  column: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  columnImage: {
    flexBasis: 200,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      paddingBottom: theme.spacing() * 2
    }
  },
  previewImage: {
    border: '1px solid rgba(0, 0, 0, 0.12)',
    height: 200,
    width: 200
  },
  columnInner: {
    paddingTop: 3,
    padding: theme.spacing() * 2,
    [theme.breakpoints.down('xs')]: {
      padding:  theme.spacing()
    },
    flexGrow: 1,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  info: {
    display: 'inline'
  },
  chip: {
    marginRight: 5,
    marginTop: 2
  }
})

export default styles
