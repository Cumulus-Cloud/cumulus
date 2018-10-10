import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { createAction } from 'store/actions'


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
        dispatch(showNotification(`Dossier « ${name} » créé avec succès`))

        // TODO
        //togglePopup('DIRECTORY_CREATION', false)(state.router)
      }
    })
})
