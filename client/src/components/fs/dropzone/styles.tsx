import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    zIndex: 9999,
    display: 'flex'
  },
  inner: {
    border: '5px lightgray dotted',
    margin: 11,
    borderRadius: 33,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  },
  icon: {
    width: 200,
    height: 200,
    fill: theme.palette.primary.main
  },
  text: {
    color: theme.palette.text.primary
  }
})

export default styles
