import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (_: Theme) => createStyles({
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
  contentHeadRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    height: '45px',
    alignItems: 'center',
    paddingRight: '61px' // Let space for the menu icon
  },
  contentTableBody: {
    flex: 1,
    display: 'flex'
  }
})

export default styles
