import Api from 'services/api'


import { ContextState } from 'utils/store'

import { ApiList } from 'models/utils'
import { ApiError } from 'models/ApiError'
import { FsNode, isFile, isDirectory } from 'models/FsNode'

import { getDirectory } from 'store/actions/directory'
import { showNotification } from 'store/actions/notifications'
import { hidePopup } from 'store/actions/popups'
import { State } from 'store/store'


export const moveNodes = (ctx: ContextState<State>) => (nodes: FsNode[], destination: string) => {
  const { getState, setState } = ctx

  setState({
    nodeDisplacement: {
      loading: true
    }
  })

  return Api.fs.moveNodes(nodes.map(node => node.id), destination)
    .then((result: ApiList<FsNode>) => {
      const state = getState()
      const currentPath = state.fs.current ? state.fs.current.path : '/'

      const hasFile = !!result.items.find(node => isFile(node))
      const hasDirectory = !!result.items.find(node => isDirectory(node))

      // Show custom message
      if (result.size == 1) {
        if (hasFile)
          showNotification(ctx)(`Fichier « ${result.items[0].name} » déplacé avec succès`)
        else
          showNotification(ctx)(`Dossier « ${result.items[0].name} » déplacé avec succès`)
      } else {
        if (hasFile && !hasDirectory)
          showNotification(ctx)(`${result.items.length} fichiers déplacés avec succès`)
        else if (!hasFile && hasDirectory)
          showNotification(ctx)(`${result.items.length} dossiers déplacés avec succès`)
        else
          showNotification(ctx)(`${result.items.length} éléments déplacés avec succès`)
      }

      setState({ nodeDisplacement: { loading: false } })

      hidePopup(ctx)()
      getDirectory(ctx)(currentPath) // Reload the current path
    })
    .catch((e: ApiError) => {
      setState({
        nodeDisplacement: {
          loading: false,
          error: e
        }
      })
    })
}
