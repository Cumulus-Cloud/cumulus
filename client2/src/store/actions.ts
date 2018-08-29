import uuid = require('uuid/v4')

import { createAction as createActionRaw, createPureAction as createPureActionRaw, ActionFactory, ActionFactoryParameter, PureActionFactoryParameter, PureActionFactory } from 'utils/store'

import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { User } from 'models/User'

import { Directory, DirectoryWithContent } from 'models/FsNode'
import { EnrichedFile } from 'models/EnrichedFile'

import { FileUploadingState } from 'store/states/fileUploadState'
import { State } from 'store/store'

const createAction = <T>(action: ActionFactoryParameter<T, State>): ActionFactory<T, State> => createActionRaw<T, State>(action)
const createPureAction = (action: PureActionFactoryParameter<State>): PureActionFactory<State> => createPureActionRaw<State>(action)

// TODO split in multiple files
// TODO check if already in loading before starting a new step ?

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

export const getDirectory = createAction<string>((path, setState, _, dispatch) => {
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
    if ('errors' in result) {
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

      return dispatch(getDirectoryContent()).then(() => { })
    }
  })

})

export const getDirectoryContent = createPureAction((setState, getState) => {
  // Prepare the loading
  setState(state => ({
    fs: {
      ...state.fs,
      loadingContent: true,
      error: undefined
    }
  }))

  const state = getState()

  const id = state.fs.current ? state.fs.current.id : ''
  const offset = state.fs.content ? state.fs.content.length : 0

  return Api.fs.getContent(id, offset).then((result: ApiError | DirectoryWithContent) => {
    if ('errors' in result) {
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

})

export const selectNode = createAction<string>((nodeId, setState) => {
  setState(state => {
    switch (state.fs.selectedContent.type) {
      case 'ALL':
        return state
      case 'NONE':
        return {
          fs: {
            ...state.fs,
            selectedContent: {
              type: 'SOME',
              selectedElements: [nodeId]
            }
          }
        }
      case 'SOME':
        return {
          fs: {
            ...state.fs,
            selectedContent: {
              type: 'SOME',
              selectedElements: state.fs.selectedContent.selectedElements.concat([nodeId])
            }
          }
        }
    }
  })
})

export const selectAllNodes = createPureAction((setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'ALL'
      }
    }
  }))
})

export const deselectNode = createAction<string>((nodeId, setState) => {
  setState(state => {
    switch (state.fs.selectedContent.type) {
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
            selectedContent: selection.length <= 0 ? {
              type: 'NONE'
            } : {
                type: 'SOME',
                selectedElements: selection
              }
          }
        }
    }
  })
})

export const deselectAllNodes = createPureAction((setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'NONE'
      }
    }
  }))
})

export const showNodeDetails = createAction<string>((nodeId, setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      detailed: (state.fs.content || []).find((node) => node.id === nodeId)
    }
  }))
})

export const createDirectory = createAction<string>((path, setState, getState, dispatch) => {
  setState({
    createDirectory: {
      loading: true
    }
  })

  return Api.fs.createDirectory(path)
    .then((result: ApiError | Directory) => {
      if ('errors' in result) {
        setState({
          createDirectory: {
            loading: false,
            error: result
          }
        })
      } else {
        const state = getState()
        const currentPath = state.fs.current ? state.fs.current.path : '/'
        const name = result.name

        setState({ createDirectory: { loading: false } })

        dispatch(getDirectory(currentPath))
        dispatch(showSnackebar(`Dossier « ${name} » créé avec succès`))

        // TODO
        //togglePopup('DIRECTORY_CREATION', false)(state.router)
      }
    })
})

export const selectUploadFile = createAction<EnrichedFile[]>((files, setState) => {
  setState(state => ({
    fileUpload: {
      ...state.fileUpload,
      files: state.fileUpload.files.concat(files)
    }
  }))
})

export const updateUploadFile = createAction<EnrichedFile>((updatedFile, setState, getState) => {
  const updatedFiles = getState().fileUpload.files.map((f) => {
    if (updatedFile.id === f.id)
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
})

export const deleteUploadFile = createAction<EnrichedFile>((deletedFile, setState) => {
  setState(state => ({
    fileUpload: {
      ...state.fileUpload,
      files: state.fileUpload.files.filter((f) => f.id !== deletedFile.id)
    }
  }))
})

export const uploadAllFiles = createPureAction((setState, getState, dispatch) => {

  const state = getState()
  const files = state.fileUpload.files
  const current = state.fs.current

  if (!current)
    throw new Error('No current directory selected') // TODO better ?

  const uploading = files.map((file) => ({
    file: file,
    loading: true,
    start: new Date(),
    progressOverTime: [{ date: new Date(), progress: 0 }],
    progress: 0
  }))

  setState({ fileUpload: { files: [], showUploadInProgress: true, uploading } })
  dispatch(showUploadProgress())

  const updateFileProgress = (file: EnrichedFile, uploads: FileUploadingState[], update: (upload: FileUploadingState) => FileUploadingState) => {
    return uploads.map((upload) => {
      if (upload.file.id === file.id)
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
              progressOverTime: [...upload.progressOverTime, { date: new Date(), progress }],
              progress,
            }
          })

          return { fileUpload: { ...state.fileUpload, uploading: updatedUploads } }
        })
      })
        .then((result: ApiError | any) => {
          if ('errors' in result) {
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
            dispatch(showSnackebar(`Erreur lors de la mise en ligne du fichier « ${file.filename} »`)) // Show a snakebar
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
            dispatch(showSnackebar(`Fichier « ${file.filename} » mis en ligne avec succès`)) // Show a snakebar
          }
        })
    })
  ).then(() => { })
})

export const showUploadProgress = createPureAction((setState) => {
  setState(state => ({
    fileUpload: {
      ...state.fileUpload,
      showUploadInProgress: true
    }
  }))
})

export const hideUploadProgress = createPureAction((setState) => {
  setState(state => ({
    fileUpload: {
      ...state.fileUpload,
      showUploadInProgress: false
    }
  }))
})

export const showSnackebar = createAction<string>((message, setState) => {
  const newMessage = { id: uuid(), message }

  setState(state => ({
    snackbar: {
      messages: state.snackbar.messages.concat(newMessage)
    }
  }))
})

export const hideSnackbar = createAction<string>((id, setState) => {
  setState(state => ({
    snackbar: {
      messages: state.snackbar.messages.slice().filter(m => m.id !== id)
    }
  }))
})
