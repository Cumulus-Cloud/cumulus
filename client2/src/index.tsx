import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './actions/store'

import { CircularProgress } from '@material-ui/core'
import WithAuthentication from './elements/utils/WithAuthentication'

import LoginApp from './pages/LoginPageContainer'
import MainApp from './pages/AppPageContainer'
import AppBackground from './elements/utils/AppBackground'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

const loader = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={100} style={{ color: 'white' }}/>
  </div>
)

ReactDOM.render(
  <Provider store={store} >
    <AppBackground>
      <Router>
        <Switch>
          <WithAuthentication
            authenticated={
              <Switch>
                <Route path="/app" render={() => <MainApp/>} />
                <Route render={() => <Redirect to='/app'/>} />
              </Switch>  
            }
            fallback={
              <Switch>
                <Route path="/auth" render={() => <LoginApp/>} />
                <Route render={(p) => <Redirect to={`/auth/sign-in?redirect=${p.location.pathname}`}/>} />
              </Switch>  
            }
            loader={loader}
          />
        </Switch>  
      </Router>
    </AppBackground>
  </Provider>,
  document.querySelector('#app')
)
