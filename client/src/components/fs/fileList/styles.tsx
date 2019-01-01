import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (_: Theme) => createStyles({
  dropzoneWrapper: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  breadCrumb: {
    flex: 1,
    width: 100,
    overflow: 'auto'
  },
  errorButton: {
    display: 'flex',
    margin: 'auto',
    textDecoration: 'none'
  },
  avatar: {
    margin: 10,
    cursor: 'pointer'
  }
})

export default styles
