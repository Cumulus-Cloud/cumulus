import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: 450,
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      height: '100%',
      display: 'flex',
      minWidth: 'inherit'
    }
  },
  content: {
    flex: 1
  }
})

export default styles
