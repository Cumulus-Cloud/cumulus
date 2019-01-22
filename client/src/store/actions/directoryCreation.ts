import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { createAction } from 'store/actions'


export const createDirectory = createAction<string>((path, setState, getState, dispatch) => {
  setState({
    directoryCreation: {
      loading: true
    }
  })

  return Api.fs.createDirectory(path)
    .then((result: Directory) => {
      const state = getState()
      const currentPath = state.fs.current ? state.fs.current.path : '/'
      const name = result.name

      setState({ directoryCreation: { loading: false } })

      dispatch(getDirectory(currentPath))
      dispatch(showNotification(`Dossier « ${name} » créé avec succès`))
    })
    .catch((e: ApiError) => {
      setState({
        directoryCreation: {
          loading: false,
          error: e
        }
      })
    })
})
