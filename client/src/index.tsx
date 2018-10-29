import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import { CircularProgress } from '@material-ui/core'

import WithAuthentication from 'components/utils/WithAuthentication'
import AppBackground from 'components/utils/AppBackground'

import AppPage from 'pages/AppPage'
import LoginPage from 'pages/LoginPage'

import { initialState, Store } from 'store/store'


const loader = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={100} style={{ color: 'white' }}/>
  </div>
)

ReactDOM.render(
  <Router history={initialState.router}>
    <Store>
      <AppBackground>
        <WithAuthentication
          authenticated={
            <Switch>
              <Route path="/app" render={() => <AppPage />} />
              <Route render={() => <Redirect to='/app'/>} />
            </Switch>
          }
          fallback={
            <Switch>
              <Route path="/auth" render={() => <LoginPage/>} />
              <Route render={() => <Redirect to="/auth/sign-in"/>}/>
            </Switch>
          }
          loader={loader}
        />
      </AppBackground>
    </Store>
  </Router>,
  document.querySelector('#app')
)
