import { createPureAction, createAction } from 'store/actions'
import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { User } from 'models/User'
import Routes from 'services/routes';


export const testUserAuth = createPureAction(setState => {
  // Start the loading
  setState(state => ({ auth: { ...state.auth, loading: true } }))

  // Start a request to get current user information
  return Api.user.me().then((result: ApiError | User) => {
    if ('errors' in result) {
      // If any error occured (401, 403, ...) assumes the user is not authenticated
      setState({ auth: { loading: false, connected: false } })
    } else {
      // We got the user back, update the state with the connected user
      setState({ auth: { loading: false, connected: true, user: result } })
    }
  })
})

export const signInUser = createAction<{ login: string, password: string }>(({ login, password }, setState, getState) => {
  // Start the loading
  setState(state => ({ signIn: { ...state.signIn, loading: true } }))

  // Start a request to sign in
  return Api.user.signIn(login, password).then((result: ApiError | { user: User }) => {
    if ('errors' in result) {
      setState({ signIn: { loading: false, error: result } })
    } else {
      setState({
        auth: { loading: false, connected: true, user: result.user },
        signIn: { loading: false }
      })
      getState().router.push('/app')
    }
  })
})

export const signUpUser = createAction<{ login: string, email: string, password: string }>(({ login, email, password }, setState, getState) => {
  // Start the loading
  setState((s) => ({ signUp: { ...s.signUp, loading: true } }))

  // Start a request to sign up
  return Api.user.signUp(login, email, password).then((result: ApiError | User) => {
    if ('errors' in result) {
      setState({ signUp: { loading: false, error: result } })
    } else {
      setState({ signUp: { loading: false, user: result } })
      getState().router.push('/auth/sign-up-confirmation')
    }
  })
})

export const signOutUser = createPureAction((setState) => {
  window.location.href = Routes.api.users.signOut // Redirect to the logout
  setState({
    auth: { loading: false, connected: false },
    signIn: { loading: false }
  })
})