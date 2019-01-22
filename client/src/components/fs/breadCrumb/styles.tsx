import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  breadCrumb: {
    flex: 1,
    width: 100,
    overflow: 'auto'
  },
  selected: {
    color: theme.palette.primary.light + ' !important'
  },
  root: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    height: '70px',
    display: 'flex',
    alignItems: 'center'
  },
  element: {
    display: 'flex',
    alignItems: 'center'
  },
  homeButton: {
    marginLeft:  theme.spacing.unit * -2,
    minWidth: 0,
    height: '36px',
    paddingTop: '5px'
  },
  button: {
    textTransform: 'none',
    fontWeight: 'normal'
  },
  icon: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  shortName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tooltip: {
    maxWidth: 'none'
  }
})

export default styles
