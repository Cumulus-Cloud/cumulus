import { ApiList } from 'models/utils'
import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { FsNode, isFile, isDirectory } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { createAction } from 'store/actions'


export const moveNodes = createAction<{ nodes: FsNode[], destination: string }>(({ nodes, destination }, setState, getState, dispatch) => {
  setState({
    nodeDisplacement: {
      loading: true
    }
  })

  return Api.fs.moveNodes(nodes.map(node => node.id), destination)
    .then((result: ApiError | ApiList<FsNode>) => {
      if ('errors' in result) {
        setState({
          nodeDisplacement: {
            loading: false,
            error: result
          }
        })
      } else {
        const state = getState()
        const currentPath = state.fs.current ? state.fs.current.path : '/'

        const hasFile = !!result.items.find(node => isFile(node))
        const hasDirectory = !!result.items.find(node => isDirectory(node))

        // Show custom message
        if (result.size == 1) {
          if (hasFile)
            dispatch(showNotification(`Fichier « ${result.items[0].name} » déplacé avec succès`))
          else
            dispatch(showNotification(`Dossier « ${result.items[0].name} » déplacé avec succès`))
        } else {
          if (hasFile && !hasDirectory)
            dispatch(showNotification(`${result.items.length} fichiers déplacés avec succès`))
          else if (!hasFile && hasDirectory)
            dispatch(showNotification(`${result.items.length} dossiers déplacés avec succès`))
          else
            dispatch(showNotification(`${result.items.length} éléments déplacés avec succès`))
        }

        setState({ nodeDisplacement: { loading: false } })
        dispatch(getDirectory(currentPath)) // Reload the current path
      }
    })
})
