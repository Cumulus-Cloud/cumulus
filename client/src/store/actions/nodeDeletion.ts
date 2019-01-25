import Api from 'services/api'

import { ContextState } from 'utils/store'

import { ApiError } from 'models/ApiError'
import { FsNode } from 'models/FsNode'
import { ApiList } from 'models/utils'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { hidePopup } from 'store/actions/popups'
import { State } from 'store/store'


export const deleteNodes = (ctx: ContextState<State>) => (nodes: FsNode[], deleteContent: boolean) => {
  const { getState, setState } = ctx

  setState({
    nodeDeletion: {
      loading: true
    }
  })

  return Api.fs.deleteNodes(nodes.map(node => node.id), deleteContent)
    .then((_: ApiList<FsNode>) => {
      const state = getState()
      const currentPath = state.fs.current ? state.fs.current.path : '/'

      showNotification(ctx)(`Suppression effectuée avec succès`)
      setState({ nodeDeletion: { loading: false } })

      hidePopup(ctx)()
      getDirectory(ctx)(currentPath) // Reload the current path
    })
    .catch((e: ApiError) => {
      setState({
        nodeDeletion: {
          loading: false,
          error: e
        }
      })
    })
}
