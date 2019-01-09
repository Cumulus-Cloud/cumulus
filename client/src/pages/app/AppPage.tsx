import  React from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'

import Page from 'components/utils/layout/Page'

import FileExplorer from 'pages/app/components/FileExplorer'
import EventViewer from 'pages/app/components/EventViewer'

import Routes from 'services/routes'


class AppPage extends React.Component<{}> {

  render() {
    return (
      <Page>
        <Switch>
          <Route path={ Routes.app.fs_matcher } component={ FileExplorer }/>
          <Route path={ Routes.app.events_matcher } component={ EventViewer }/>
          <Route render={ () => <Redirect to={ `${Routes.app.fs}/` }/> }/>
        </Switch>
      </Page>
    )
  }
}


export default AppPage
