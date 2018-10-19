import { ApiList } from 'models/utils'
import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { FsNode } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { createAction } from 'store/actions'


export const moveNodes = createAction<{ ids: string[], destination: string }>(({ ids, destination }, setState, getState, dispatch) => {
  setState({
    nodeDisplacement: {
      loading: true
    }
  })

  return Api.fs.moveNodes(ids, destination)
    .then((result: ApiError | ApiList<FsNode>) => {
      if ('errors' in result) {
        setState({
          directoryCreation: {
            loading: false,
            error: result
          }
        })
      } else {
        const state = getState()
        const currentPath = state.fs.current ? state.fs.current.path : '/'

        console.log(result)

        const hasFile = !!result.items.find(node => node.nodeType === 'FILE')
        const hasDirectory = !!result.items.find(node => node.nodeType === 'DIRECTORY')

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
