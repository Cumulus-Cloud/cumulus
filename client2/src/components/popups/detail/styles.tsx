import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    maxWidth: 700
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  details: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  heading: {
    paddingLeft: 15,
    paddingTop: 2,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  headingSelected: {
    paddingLeft: 15,
    paddingTop: 2,
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  button: {
    width: 50,
    height: 45,
    marginTop: 20,
    display: 'block'
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
      paddingBottom: theme.spacing.unit * 2
    }
  },
  previewImage: {
    border: '1px solid rgba(0, 0, 0, 0.12)',
    height: 200,
    width: 200
  },
  columnInner: {
    paddingTop: 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      padding:  theme.spacing.unit
    },
    flexGrow: 1,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  info: {
    display: 'inline'
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  chip: {
    marginRight: 5,
    marginTop: 2
  }
})

export default styles
