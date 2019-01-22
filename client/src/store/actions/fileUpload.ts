import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'

import { showNotification } from 'store/actions/notifications'
import { createAction, createPureAction } from 'store/actions'

import { FileUploadingState } from 'store/states/fileUploadState'


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
      .then(() => {
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
        dispatch(showNotification(`Fichier « ${file.filename} » mis en ligne avec succès`))
      })
      .catch((e: ApiError) => {
        setState(state => {
          const updatedUploads =
            updateFileProgress(file, state.fileUpload.uploading, (upload) => {
              return {
                ...upload,
                progress: 100,
                loading: false,
                error: e
              }
            })

          return { fileUpload: { ...state.fileUpload, uploading: updatedUploads } }
        })
        dispatch(showNotification(`Erreur lors de la mise en ligne du fichier « ${file.filename} »`))
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
