import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Slide from '@material-ui/core/Slide'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'


const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    minWidth: 0,
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    backgroundColor: 'white'
  },
  header: {
    display: 'flex',
    height: 70
  },
  content: {
    display: 'flex',
    flex: 1,
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
    flexDirection: 'column'
  },
  innerContent: {
    display: 'flex',
    flex: 1, // Needed to take all the space available
    flexDirection: 'column'
  },
  error: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.grey[600]
  },
  errorIcon: {
    marginRight: theme.spacing.unit
  },
  errorInfo : {
    alignItems: 'center',
    display: 'flex'
  },
  errorActions: {
    paddingTop: theme.spacing.unit * 3
  },
  loader: {
    display: 'block',
    margin: 'auto',
    marginTop: theme.spacing.unit * 5
  }
})


type PropsError = {
  icon: JSX.Element,
  text: string,
  actions?: JSX.Element
}

type PropsErrorWithStyle = PropsError & WithStyles<typeof styles>

class CumulusContentErrorElement extends React.Component<PropsErrorWithStyle, {}> {

  render() {
    const { icon, text, actions, classes } = this.props

    return (
      <Typography variant="caption" className={ classes.error }>
        <div className={ classes.errorInfo }>
          <div className={ classes.errorIcon } >
            { icon }
          </div>
          <div>
            { text }
          </div>
        </div>
        {
          actions &&
          <div className={ classes.errorActions } >
            { actions }
          </div>
        }
      </Typography>
    )
  }

}

type Props = {
  header: JSX.Element
  loading: boolean
  content?: JSX.Element | false
  error?: JSX.Element | false
}

type PropsWithStyle = Props & WithStyles<typeof styles>


class CumulusContent extends React.Component<PropsWithStyle, {}> {

  render() {
    const { header, content, loading, error, classes } = this.props


    const loader = (
      loading && (
        <div>
          <CircularProgress className={ classes.loader } size={ 100 } color="primary"/>
        </div>
      )
    )

    const errorElement = (
      !loading && error &&
      <Slide direction="up" in >
        <Typography variant="caption" className={ classes.error }>
          { error }
        </Typography>
      </Slide>
    )

    const contentElement = (
      !loading && !error &&
      <Slide direction="up" in >
        <div className={ classes.innerContent } >
          { content }
        </div>
      </Slide>
    )

    return (
      <main className={ classes.root }>
        <div className={ classes.header } >
          { header }
        </div>
        <div className={ classes.content } >
          { loader || errorElement || contentElement }
        </div>
      </main>
    )

  }

}

export default withStyles(styles)(CumulusContent)

export const CumulusContentError = withStyles(styles)(CumulusContentErrorElement)

