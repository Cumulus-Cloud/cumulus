import { AppError } from 'models/ApiError'
import { User } from 'models/User'

import Routes from 'services/routes'
import Api from 'services/api'

import { State } from 'store/store'
import { ContextState } from 'utils/store'


export const testUserAuth = ({ setState }: ContextState<State>) => () => {
  // Start the loading
  setState(state => ({ auth: { ...state.auth, loading: true } }))

  // Start a request to get current user information
  Api.user.me()
    .then((result: User) => {
      // We got the user back, update the state with the connected user
      setState({ auth: { loading: false, connected: true, user: result } })
    })
    .catch(() => {
      // If any error occured (401, 403, ...) assumes the user is not authenticated
      setState({ auth: { loading: false, connected: false } })
    })
}

export const signInUser = ({ setState, getState }: ContextState<State>) => (login: string, password: string) => {
  // Start the loading
  setState(state => ({ signIn: { ...state.signIn, loading: true } }))

  // Start a request to sign in
  Api.user.signIn(login, password)
    .then((result: { user: User }) => {
      setState({
        auth: { loading: false, connected: true, user: result.user },
        signIn: { loading: false }
      })
      getState().router.push('/app')
    })
    .catch((e: AppError) => {
      setState({ signIn: { loading: false, error: e } })
    })
}

export const signUpUser = ({ setState, getState }: ContextState<State>) => (login: string, email: string, password: string) => {
  // Start the loading
  setState((s) => ({ signUp: { ...s.signUp, loading: true } }))

  // Start a request to sign up
  Api.user.signUp(login, email, password).then((result: User) => {
    setState({ signUp: { loading: false, user: result } })
    getState().router.push('/auth/sign-up-confirmation')
  })
  .catch((e: AppError) => {
    setState({ signUp: { loading: false, error: e } })
  })
}

export const signOutUser = ({ setState }: ContextState<State>) => () => {
  window.location.href = Routes.api.users.signOut // Redirect to the logout
  setState({
    auth: { loading: false, connected: false },
    signIn: { loading: false }
  })
}
