import { createBrowserHistory, History } from 'history'

import { createStore, Dispatcher } from 'utils/store'

import AuthenticationState from 'store/states/authenticationState'
import SignInState from 'store/states/signInState'
import SignUpState from 'store/states/signUpState'
import FsState from 'store/states/fsState'
import CreateDirectoryState from 'store/states/createDirectoryState'
import FileUploadState from 'store/states/fileUploadState'
import SnackbarState from 'store/states/snackbarState'

// TODO split in multiple files
export type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  createDirectory: CreateDirectoryState
  fileUpload: FileUploadState
  snackbar: SnackbarState
  router: History
}

// TODO split in multiple files
export const initialState: State = {
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
  createDirectory: {
    loading: false
  },
  fileUpload: {
    files: [],
    uploading: [],
    showUploadInProgress: false
  },
  snackbar: {
    messages: []
  },
  router: createBrowserHistory()
}

export const { Store, withStore } = createStore<State>(initialState)

export const connect = <T>(mapping: (state: State, dispatch: Dispatcher<State>) => T) => ( mapping )
