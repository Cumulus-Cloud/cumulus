import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { CircularProgress, Snackbar } from '@material-ui/core'
import WithAuthentication from './elements/utils/WithAuthentication'
import AppPage from './pages/AppPage'
import AppBackground from './elements/utils/AppBackground'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Router } from 'react-router-dom'
import { createBrowserHistory, History } from 'history'
import uuid = require('uuid/v4')

import LoginPage from './pages/LoginPage'
import { createStore, Action as StoreAction, PureAction as StorePureAction } from './actions/store'
import AuthenticationState from './actions/user/auth/authenticationState'
import CreateDirectoryState from './actions/fs/directoryCreation/createDirectoryState'
import SnackbarState from './actions/snackbar/snackbarState'
import Api from './services/api'
import { User } from './models/User'
import { ApiError } from './models/ApiError'
import SignInState from './actions/user/signIn/signInState'
import SignUpState from './actions/user/signUp/signUpState'
import FsState from './actions/fs/fsState'
import { Directory, DirectoryWithContent } from './models/FsNode'
import FileUploadState, { FileUploadingState } from './actions/fs/fileUpload/fileUploadState'
import { EnrichedFile } from './models/EnrichedFile'

// TODO split in multiple files
type State = {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  createDirectory: CreateDirectoryState
  fileUpload: FileUploadState
  snackbar: SnackbarState
  router: History
}

type Action<T> = StoreAction<T, State, Actions>
type PureAction = StorePureAction<State, Actions>

// TODO split in multiple files
type Actions = {
  testUserAuth: PureAction
  signInUser: Action<{ login: string, password: string }>
  signUpUser: Action<{ login: string, email: string, password: string }>
  getDirectory: Action<string>
  getDirectoryContent: PureAction
  selectNode: Action<string>
  selectAllNodes: PureAction
  deselectNode: Action<string>
  deselectAllNodes: PureAction
  showNodeDetails: Action<string>
  createDirectory: Action<string>
  selectUploadFile: Action<EnrichedFile[]>
  updateUploadFile: Action<EnrichedFile>
  deleteUploadFile: Action<EnrichedFile>
  uploadAllFiles: PureAction
  showUploadProgress: PureAction
  hideUploadProgress: PureAction
  showSnackebar: Action<string>
  hideSnackbar: Action<string>
}

// TODO split in multiple files
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

// TODO split in multiple files
const actions: Actions = {

  // TODO check if already in loading before starting a new step ?

  testUserAuth: ((_, setState) => {
    // Start the loading
    setState(state => ({ auth: { ...state.auth, loading: true } }))

    // Start a request to get current user information
    return Api.user.me().then((result: ApiError | User) => {
      if('errors' in result) {
        // If any error occured (401, 403, ...) assumes the user is not authenticated
        setState({ auth: { loading: false, connected: false } })
      } else {
        // We got the user back, update the state with the connected user
        setState({ auth: { loading: false, connected: true, user: result } })
      }
    })
  }),

  signInUser: (({ login, password }, setState, getContext) => {
    // Start the loading
    setState(state => ({ signIn: { ...state.signIn, loading: true } }))

    // Start a request to sign in
    return Api.user.signIn(login, password).then((result: ApiError | { user: User }) => {
      if('errors' in result) {
        setState({ signIn: { loading: false, error: result } })
      } else {
        setState({
          auth: { loading: false, connected: true, user: result.user },
          signIn: { loading: false }
        })
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
        setState({ signUp: { loading: false, error: result } })
      } else {
        setState({ signUp: { loading: false, user: result } })
        getContext().state.router.push('/auth/sign-up-confirmation')
      }
    })
  }),

  getDirectory: ((path, setState, getContext) => {
    // Prepare the loading
    setState(state => ({
      fs: {
        ...state.fs,
        loadingCurrent: true,
        loadingContent: false,
        selectedContent: { type: 'NONE' },
        error: undefined
      }
    }))

    return Api.fs.getDirectory(path).then((result: ApiError | Directory) => {
      if('errors' in result) {
        setState({
          fs: {
            loadingCurrent: false,
            loadingContent: false,
            selectedContent: { type: 'NONE' },
            error: result
          }
        })

        return Promise.resolve()
      } else {
        setState({
          fs: {
            loadingCurrent: false,
            loadingContent: true,
            current: result,
            content: undefined, // We switched directory, so also switch the loaded content
            contentSize: undefined,
            selectedContent: { type: 'NONE' },
            error: undefined
          }
        })

        return getContext().actions.getDirectoryContent().then(() => {})
      }
    })

  }),

  getDirectoryContent: ((_, setState, getContext) => {
    // Prepare the loading
    setState(state => ({
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
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: result
          }
        }))
      } else {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            content: state.fs.content ? state.fs.content.concat(result.content.items) : result.content.items,
            contentSize: result.totalContentLength,
            error: undefined
          }
        }))
      }
      
    })
    
  }),

  selectNode: ((nodeId, setState) => {
    setState(state => {
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
    setState(state => ({
      fs: {
        ...state.fs,
        selectedContent: {
          type: 'ALL'
        }
      }
    }))
  }),

  deselectNode: ((nodeId, setState) => {
    setState(state => {
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
    setState(state => ({
      fs: {
        ...state.fs,
        selectedContent: {
          type: 'NONE'
        }
      }
    }))
  }),

  showNodeDetails: ((nodeId, setState) => {
    setState(state => ({
      fs : {
        ...state.fs,
        detailed: (state.fs.content || []).find((node) => node.id === nodeId)
      }
    }))
  }),

  createDirectory: ((path, setState, getContext) => {

    setState({
      createDirectory: {
        loading: true
      }
    })

    return Api.fs.createDirectory(path)
      .then((result: ApiError | Directory) => {
        if('errors' in result) {
          setState({
            createDirectory: {
              loading: false,
              error: result
            }
          })
        } else {
          const state = getContext().state
          const currentPath = state.fs.current ? state.fs.current.path : '/'
          const name = result.name

          setState({ createDirectory: { loading: false } })

          getContext().actions.getDirectory(currentPath)
          getContext().actions.showSnackebar(`Dossier « ${name} » créé avec succès`)

          // TODO
          //togglePopup('DIRECTORY_CREATION', false)(state.router)
        }
      })
  }),


  selectUploadFile: ((files, setState) => {
    setState(state => ({
      fileUpload: {
        ...state.fileUpload,
        files: state.fileUpload.files.concat(files)
      }
    }))
  }),

  updateUploadFile: ((updatedFile, setState, getContext) => {
    const updatedFiles = getContext().state.fileUpload.files.map((f) => {
      if(updatedFile.id === f.id)
        return updatedFile
      else
        return f
    })
    
    setState(state => ({
      fileUpload: {
        ...state.fileUpload,
        files: updatedFiles
      }
    }))
  }),

  deleteUploadFile: ((deletedFile, setState) => {
    setState(state => ({
      fileUpload: {
        ...state.fileUpload,
        files: state.fileUpload.files.filter((f) => f.id !== deletedFile.id)
      }
    }))
  }),
  
  uploadAllFiles: ((_, setState, getContext) => {

    const state = getContext().state
    const files = state.fileUpload.files
    const current = state.fs.current

    if(!current)
      throw new Error('No current directory selected') // TODO better ?

    const uploading = files.map((file) => ({
      file: file,
      loading: true,
      start: new Date(),
      progressOverTime: [ { date: new Date(), progress: 0 } ],
      progress: 0
    }))

    setState({ fileUpload: { files: [], showUploadInProgress: true, uploading } })
    getContext().actions.showUploadProgress()

    const updateFileProgress = (file: EnrichedFile, uploads: FileUploadingState[], update: (upload: FileUploadingState) => FileUploadingState) => {
      return uploads.map((upload) => {
        if(upload.file.id === file.id)
          return update(upload)
        else
          return upload
      })
    }

    // TODO cut into multiple files

    return Promise.all(
      files.map(file => {
        Api.fs.uploadFile(current.id, file, (progress) => {
          setState(state => {
            const { uploading } = state.fileUpload

            const updatedUploads = updateFileProgress(file, uploading, (upload) => {
              return {
                ...upload,
                progressOverTime: [ ...upload.progressOverTime, { date: new Date(), progress } ],
                progress, 
              }
            })
      
            return { fileUpload: { ...state.fileUpload, uploading: updatedUploads } }
          })
        })
        .then((result: ApiError | any) => {
          if('errors' in result) {
            setState(state => {
              const updatedUploads =
                updateFileProgress(file, state.fileUpload.uploading, (upload) => {
                  return {
                    ...upload,
                    progress: 100,
                    loading: false,
                    error: result
                  }
                })

              return { fileUpload: { ...state.fileUpload, uploading: updatedUploads } }
            })
            getContext().actions.showSnackebar(`Erreur lors de la mise en ligne du fichier « ${file.filename} »`) // Show a snakebar
          } else {
            setState(state => {
              const updatedUploads =
                updateFileProgress(file, state.fileUpload.uploading, (upload) => {
                  return {
                    ...upload,
                    progress: 100,
                    loading: false
                  }
                })

              return { fileUpload: { ...state.fileUpload, uploading: updatedUploads } }
            })
            getContext().actions.showSnackebar(`Fichier « ${file.filename} » mis en ligne avec succès`) // Show a snakebar
          }
        })
      })
    ).then(() => {})
  }),

  showUploadProgress: ((_, setState) => {
    setState(state => ({
      fileUpload: {
        ...state.fileUpload,
        showUploadInProgress: true
      }
    }))
  }),

  hideUploadProgress: ((_, setState) => {
    setState(state => ({
      fileUpload: {
        ...state.fileUpload,
        showUploadInProgress: false
      }
    }))
  }),

  showSnackebar: ((message, setState) => {
    const newMessage = { id: uuid(), message }
    
    setState(state => ({
      snackbar: {
        messages: state.snackbar.messages.concat(newMessage)
      }
    }))
  }),

  hideSnackbar: ((id, setState) => {
    setState(state => ({
      snackbar: {
        messages: state.snackbar.messages.slice().filter(m => m.id !== id)
      }
    }))
  })

}

export const { Store, withStore } = createStore<State, Actions>(initialState, actions)

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
