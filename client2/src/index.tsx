import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { CircularProgress } from '@material-ui/core'
import WithAuthentication from './elements/utils/WithAuthentication'
import AppPage from './pages/AppPage'
import AppBackground from './elements/utils/AppBackground'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Router } from 'react-router-dom'
import { createBrowserHistory, History } from 'history'

import LoginPage from './pages/LoginPage'
import { createStore, Action, PureAction } from './actions/store2'
import AuthenticationState from './actions/user/auth/authenticationState'
import Api from './services/api'
import { User } from './models/User'
import { ApiError } from './models/ApiError'
import SignInState from './actions/user/signIn/signInState'
import SignUpState from './actions/user/signUp/signUpState'
import FsState from './actions/fs/fsState'
import { Directory, DirectoryWithContent } from './models/FsNode'

type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  router: History
}

type Actions = {
  testUserAuth: PureAction<State, Actions>
  signInUser: Action<{ login: string, password: string }, State, Actions>
  signUpUser: Action<{ login: string, email: string, password: string }, State, Actions>
  getDirectory: Action<string, State, Actions>
  getDirectoryContent: PureAction<State, Actions>
  selectNode: Action<string, State, Actions>
  selectAllNodes: PureAction<State, Actions>
  deselectNode: Action<string, State, Actions>
  deselectAllNodes: PureAction<State, Actions>
  showNodeDetails: Action<string, State, Actions>
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
  fs: {
    loadingCurrent: false,
    loadingContent: false,
    selectedContent: { type: 'NONE' }
  },
  router: createBrowserHistory()
}

const actions: Actions = {

  // TODO check if already in loading before starting a new step ?

  testUserAuth: ((_, setState) => {
    // Start the loading
    setState((state) => ({ auth: { ...state.auth, loading: true } }))

    // Start a request to get current user information
    return Api.user.me().then((result: ApiError | User) => {
      if('errors' in result) {
        // If any error occured (401, 403, ...) assumes the user is not authenticated
        setState(() => ({ auth: { loading: false, connected: false } }))
      } else {
        // We got the user back, update the state with the connected user
        setState(() => ({ auth: { loading: false, connected: true, user: result } }))
      }
    })
  }),

  signInUser: (({ login, password }, setState, getContext) => {
    // Start the loading
    setState((state) => ({ signIn: { ...state.signIn, loading: true } }))

    // Start a request to sign in
    return Api.user.signIn(login, password).then((result: ApiError | { user: User }) => {
      if('errors' in result) {
        setState(() => ({ signIn: { loading: false, error: result } }))
      } else {
        setState(() => ({
          auth: { loading: false, connected: true, user: result.user },
          signIn: { loading: false }
        }))
        getContext().state.router.push('/app')
      }
    })
  }),

  signUpUser: (({ login, email, password }, setState, getContext) => {
    // Start the loading
    setState((s) => ({ signUp: { ...s.signUp, loading: true } }))
    
    // Start a request to sign up
    return Api.user.signUp(login, email, password).then((result: ApiError | User) => {
      if('errors' in result) {
        setState(() => ({ signUp: { loading: false, error: result } }))
      } else {
        setState(() => ({ signUp: { loading: false, user: result } }))
        getContext().state.router.push('/auth/sign-up-confirmation')
      }
    })
  }),

  getDirectory: ((path, setState, getContext) => {
    // Prepare the loading
    setState(() => ({
      fs: {
        loadingCurrent: true,
        loadingContent: false,
        selectedContent: { type: 'NONE' },
        error: undefined
      }
    }))

    return Api.fs.getDirectory(path).then((result: ApiError | Directory) => {
      if('errors' in result) {
        setState(() => ({
          fs: {
            loadingCurrent: false,
            loadingContent: false,
            selectedContent: { type: 'NONE' },
            error: result
          }
        }))
      } else {
        setState(() => ({
          fs: {
            loadingCurrent: false,
            loadingContent: false,
            current: result,
            content: undefined, // We switched directory, so also switch the loaded content
            contentSize: undefined,
            selectedContent: { type: 'NONE' },
            error: undefined
          }
        }))

        return getContext().actions.getDirectoryContent()
      }
    })

  }),

  getDirectoryContent: ((_, setState, getContext) => {
    // Prepare the loading
    setState((state) => ({
      fs: {
        ...state.fs,
        loadingContent: true,
        error: undefined
      }
    }))

    const state = getContext().state

    const id = state.fs.current ? state.fs.current.id : ''
    const offset = state.fs.content ? state.fs.content.length : 0

    return Api.fs.getContent(id, offset).then((result: ApiError | DirectoryWithContent) => {
      if('errors' in result) {
        setState((state) => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: result
          }
        }))
      } else {
        setState((state) => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            content: state.fs.content ? state.fs.content.concat(result.content.items) : result.content.items,
            contentSize: result.content.size,
            error: undefined
          }
        }))
      }
      
    })
    
  }),

  selectNode: ((nodeId, setState) => {
    setState((state) => {
      switch(state.fs.selectedContent.type) {
        case 'ALL':
          return state
        case 'NONE':
          return {
            fs: {
              ...state.fs,
              selectedContent : {
                type: 'SOME',
                selectedElements: [ nodeId ]
              }
            }
          }
        case 'SOME':
          return {
            fs: {
              ...state.fs,
              selectedContent : {
                type: 'SOME',
                selectedElements: state.fs.selectedContent.selectedElements.concat([ nodeId ])
              }
            }
          }
      }
    })
  }),

  selectAllNodes: ((_, setState) => {
    setState((state) => ({
      fs: {
        ...state.fs,
        selectedContent: {
          type: 'ALL'
        }
      }
    }))
  }),

  deselectNode: ((nodeId, setState) => {
    setState((state) => {
      switch(state.fs.selectedContent.type) {
        case 'ALL': {
          const selection = (state.fs.content || []).map((node) => node.id).filter((id) => id !== nodeId)
          return {
            fs: {
              ...state.fs,
              selectedContent: {
                type: 'SOME',
                selectedElements: selection
              }
            }
          }
        }
        case 'NONE':
          return state
        case 'SOME':
          const selection = state.fs.selectedContent.selectedElements.filter((id) => id !== nodeId)
          return {
            fs: {
              ...state.fs,
              selectedContent : selection.length <= 0 ? {
                type: 'NONE'
              } : {
                type: 'SOME',
                selectedElements: selection
              }
            }
          }
      }
    })
  }),

  deselectAllNodes: ((_, setState) => {
    setState((state) => ({
      fs: {
        ...state.fs,
        selectedContent: {
          type: 'NONE'
        }
      }
    }))
  }),

  showNodeDetails: ((nodeId, setState) => {
    setState((state) => ({
      fs : {
        ...state.fs,
        detailed: (state.fs.content || []).find((node) => node.id === nodeId)
      }
    }))
  })

}

export const { Store, withStore } = createStore<State, Actions>(initialState, actions)

//export const withStore2: (param: (ctx: ContextState<State, Actions>) => JSX.Element) => (() => JSX.Element) = (action) => {
//  return () => withStore(action)
//}

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
              <Route path="/app" render={() => <AppPage/>} />
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
