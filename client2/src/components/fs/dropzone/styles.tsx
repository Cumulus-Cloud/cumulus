import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (_: Theme) => createStyles({
  root: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    color: '#fff',
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
    justifyContent: 'center'
  },
  icon: {
    width: 200,
    height: 200
  },
  text: {
    color: 'white'
  }
})

export default styles
