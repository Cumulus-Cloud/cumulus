import Api from 'services/api'

import { ContextState } from 'utils/store'

import { AppError } from 'models/ApiError'
import { Directory } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { hidePopup } from 'store/actions/popups'
import { State } from 'store/store'


export const createDirectory =  (ctx: ContextState<State>) => (path: string) => {
  const { getState, setState } = ctx

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

      getDirectory(ctx)(currentPath)
      hidePopup(ctx)()
      showNotification(ctx)(`Dossier « ${name} » créé avec succès`)
    })
    .catch((e: AppError) => {
      setState({
        directoryCreation: {
          loading: false,
          error: e
        }
      })
    })
}
