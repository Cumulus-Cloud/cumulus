import { ApiList } from 'models/utils'
import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { FsNode } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { createAction } from 'store/actions'


export const deleteNodes = createAction<{ nodes: FsNode[], deleteContent: boolean }>(({ nodes, deleteContent }, setState, getState, dispatch) => {
  setState({
    nodeDeletion: {
      loading: true
    }
  })

  return Api.fs.deleteNodes(nodes.map(node => node.id), deleteContent)
    .then((result: ApiError | ApiList<FsNode>) => {
      if ('errors' in result) {
        setState({
          nodeDeletion: {
            loading: false,
            error: result
          }
        })
      } else {
        const state = getState()
        const currentPath = state.fs.current ? state.fs.current.path : '/'

        dispatch(showNotification(`Suppression effectuée avec succès`))

        setState({ nodeDeletion: { loading: false } })
        dispatch(getDirectory(currentPath)) // Reload the current path
      }
    })
})
