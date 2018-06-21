import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { CircularProgress } from '@material-ui/core'
import WithAuthentication from './elements/utils/WithAuthentication'
import MainApp from './pages/AppPageContainer'
import AppBackground from './elements/utils/AppBackground'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'

import store, { history } from './actions/store'
import LoginPage from './pages/LoginPage'

const loader = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={100} style={{ color: 'white' }}/>
  </div>
)

ReactDOM.render(
  <Provider store={store} >
    <AppBackground>
      <ConnectedRouter history={history}>
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
                <Route path="/auth" render={() => <LoginPage/>} />
                <Route render={(p) => {
                console.log("index")
                console.log(p)
                return (<Redirect to="/auth/sign-in"/>)
              
              }}/>
              </Switch>  
            }
            loader={loader}
          />
        </Switch>  
      </ConnectedRouter>
    </AppBackground>
  </Provider>,
  document.querySelector('#app')
)
 // ?redirect=${p.location.pathname}