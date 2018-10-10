import { createBrowserHistory, History } from 'history'

import { createStore, Dispatcher } from 'utils/store'

import AuthenticationState, { initialState as initialAuthState } from 'store/states/authenticationState'
import SignInState from 'store/states/signInState'
import SignUpState from 'store/states/signUpState'
import FsState, { initialState as initialFsState } from 'store/states/fsState'
import CreateDirectoryState from 'store/states/createDirectoryState'
import FileUploadState, { initialState as initialFileUploadState } from 'store/states/fileUploadState'
import NotificationsState, { initialState as initialNotificationsState } from 'store/states/notificationsState'
import PopupsState, { initialState as initialPopupsState } from 'store/states/popupsState'


export type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  createDirectory: CreateDirectoryState
  fileUpload: FileUploadState
  notifications: NotificationsState
  popups: PopupsState
  router: History
}

export const initialState: State = {
  auth: initialAuthState(),
  signIn: { loading: false },
  signUp: { loading: false },
  fs: initialFsState(),
  createDirectory: { loading: false },
  fileUpload: initialFileUploadState(),
  notifications: initialNotificationsState(),
  popups: initialPopupsState(),
  router: createBrowserHistory()
}

export const { Store, withStore } = createStore<State>(initialState)

export const connect = <T>(mapping: (state: State, dispatch: Dispatcher<State>) => T) => ( mapping )
