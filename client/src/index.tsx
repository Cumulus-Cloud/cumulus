import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import { CircularProgress } from '@material-ui/core'

import WithAuthentication from 'components/utils/WithAuthentication'
import AppBackground from 'components/utils/AppBackground'

import AppPage from 'pages/app/AppPage'
import FailurePage from 'pages/app/FailurePage'
import LoginPage from 'pages/login/LoginPage'

import { initialState, Provider } from 'store/store'


const loader = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={100} style={{ color: 'white' }}/>
  </div>
)

ReactDOM.render(
  <Router history={initialState.router}>
    <Provider>
      <AppBackground>
        {
          error ?
          <FailurePage /> :
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
        }
      </AppBackground>
    </Provider>
  </Router>,
  document.querySelector('#app')
)
