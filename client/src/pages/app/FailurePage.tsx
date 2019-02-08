import React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import RefreshIcon from '@material-ui/icons/Refresh'
import CancelIcon from '@material-ui/icons/Cancel'
import EditIcon from '@material-ui/icons/Edit'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'

import Layout from 'components/utils/layout/Layout'
import { ActionGroup } from 'components/utils/layout/Menu'
import Content from 'components/utils/layout/Content'
import Page from 'components/utils/layout/Page'

import Api from 'services/api'

import { ApiError } from 'models/ApiError'

import { useNotifications } from 'store/store'


const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    minHeight: '100%'
  },
  content: {
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  margin: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.primary.light,
    color: 'white'
  },
  drawerStatic: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  main: {
    flexGrow: 1,
    backgroundColor: 'white',
    minWidth: 0,
    flexDirection: 'column',
    padding: '40px',
    overflow: 'auto'
  },
  errorTitle: {
    marginTop: theme.spacing.unit * 3
  }
})


type PropsWithStyle = WithStyles<typeof styles>


function FailurePage({ classes }: PropsWithStyle) {

  const { showNotification } = useNotifications()

  function reloadServer() {
    Api.management.reload()
      .then(() => {
        showNotification('Cumulus server reloading...')
        setTimeout(() => {
          location.reload();
        }, 8000)
      })
      .catch((e: ApiError) => {
        showNotification(`Cumulus server reloading failed: ${e.message}`)
      })
  }

  function stopServer() {
    Api.management.stop()
      .then(() => {
        showNotification('Stopping Cumulus server...')
        setTimeout(() => {
          location.reload();
        }, 8000)
      })
      .catch((e: ApiError) => {
        showNotification(`Cumulus server stop failed: ${e.message}`)
      })
  }

  function updateServerConfiguration() {
    showNotification('Not implemented yet')
  }

  const serverErrors = error ? error.causes : []

  const actions: ActionGroup = {
    actions: [
      {
        icon: <RefreshIcon />,
        label: 'Recharger le serveur',
        action: reloadServer
      },
      {
        icon: <CancelIcon />,
        label: 'Arrêter le serveur',
        action: stopServer
      },
      {
        icon: <EditIcon />,
        label: 'Modifier la configuration',
        action: updateServerConfiguration
      }
    ]
  }

  return (
    <Page>
      <Layout actions={ [ actions ] } >
        <Content
          header={ <></> }
          loading={ false }
          content={
            <>
              <Typography variant="h2" gutterBottom >
                Oh no, an error occurred! 😢
              </Typography>
              <Typography variant="body1" gutterBottom>
                An error preventing the Cumulus server to start has occurred. The server is now started in recovery mode to show you what went wrong.
              </Typography>
              <br/>
              <Typography variant="body1" gutterBottom>
                Errors usually come from configuration error such as an unreachable database. Use the returned error message below to see what when wrong.
                In futures versions, Cumulus will try to guess what went wrong.
              </Typography>
              <Typography variant="h4" className={ classes.errorTitle } gutterBottom>
                Error description:
              </Typography>
              <Table>
                <TableBody>
                  {
                    serverErrors.map((serverError, i) => (
                      <TableRow key={i} >
                        <TableCell>{ i === 0 ? serverError.message : `Caused by: ${serverError.message}` }</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </>
          }
        />
      </Layout>
    </Page>
  )

}


export default withStyles(styles)(FailurePage)
