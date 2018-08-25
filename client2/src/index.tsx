import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { CircularProgress } from '@material-ui/core'
import WithAuthentication from './elements/utils/WithAuthentication2'
import MainApp from './pages/AppPageContainer'
import AppBackground from './elements/utils/AppBackground'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Router } from 'react-router-dom'
import { createBrowserHistory, History } from 'history'

import LoginPage from './pages/LoginPage'
import { createStore, createAction, createPureAction } from './actions/store2'
import AuthenticationState from './actions/user/auth/authenticationState'
import Api from './services/api'
import { User } from './models/User'
import { ApiError } from './models/ApiError'
import SignInState from './actions/user/signIn/signInState'
import SignUpState from './actions/user/signUp/signUpState'

type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  router: History
}

const initialState: State = {
  auth: {
    loading: true, // Hack to avoid loading the sign in page
    connected: false
  },
  signIn: {
    loading: false
  },
  signUp: {
    loading: false
  },
  router: createBrowserHistory()
}

const actions = {

  testUserAuth: createPureAction<State>((setState) => {
    // Start the loading
    setState((s) => ({ auth: { ...s.auth, loading: true } }))

    // Start a request to get current user information
    Api.user.me().then((result: ApiError | User) => {
      if('errors' in result) {
        // If any error occured (401, 403, ...) assumes the user is not authenticated
        setState(() => ({ auth: { loading: false, connected: false } }))
      } else {
        // We got the user back, update the state with the connected user
        setState(() => ({ auth: { loading: false, connected: true, user: result } }))
      }
    })
  }),

  signInUser: createAction<{ login: string, password: string }, State>(({ login, password }, setState, getState) => {
    // Start the loading
    setState((s) => ({ signIn: { ...s.signIn, loading: true } }))

    // Start a request to sign in
    Api.user.signIn(login, password).then((result: ApiError | { user: User }) => {
      if('errors' in result) {
        setState(() => ({ signIn: { loading: false, error: result } }))
      } else {
        setState(() => ({
          auth: { loading: false, connected: true, user: result.user },
          signIn: { loading: false }
        }))
        getState().router.push('/app')
      }
    })
  }),

  signUpUser: createAction<{ login: string, email: string, password: string }, State>(({ login, email, password }, setState, getState) => {
    // Start the loading
    setState((s) => ({ signUp: { ...s.signUp, loading: true } }))
    
    // Start a request to sign up
    Api.user.signUp(login, email, password).then((result: ApiError | User) => {
      if('errors' in result) {
        setState(() => ({ signUp: { loading: false, error: result } }))
      } else {
        setState(() => ({ signUp: { loading: false, user: result } }))
        getState().router.push('/auth/sign-up-confirmation')
      }
    })
  })

}

export const { Store, withStore } = createStore<State, typeof actions>(initialState, actions)


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
              <Route path="/app" render={() => <h1>Connected !</h1>} />
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

/*
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
                <Route render={() => <Redirect to="/auth/sign-in"/>}/>
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
*/