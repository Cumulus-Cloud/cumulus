import Api from 'services/api'

import { ContextState } from 'utils/store'

import { ApiError } from 'models/ApiError'
import { Directory, DirectoryWithContent, SearchResult } from 'models/FsNode'

import { Search } from 'store/states/fsState'
import { State } from 'store/store'


export const getDirectory = (ctx: ContextState<State>) => (path: string) => {

  const { setState } = ctx

  // Prepare the loading
  setState(state => ({
    fs: {
      ...state.fs,
      loadingCurrent: true,
      loadingContent: false,
      selectedContent: { type: 'NONE' },
      search: undefined,
      error: undefined
    }
  }))

  Api.fs.getDirectory(path)
    .then((result: Directory) => {
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

      getDirectoryContent(ctx)()
    })
    .catch((e: ApiError) => {
        setState({
          fs: {
            loadingCurrent: false,
            loadingContent: false,
            selectedContent: { type: 'NONE' },
            error: e
          }
        })
    })

}

export const getDirectoryContent = ({ setState, getState }: ContextState<State>) => () => {
  // Prepare the loading
  setState(state => ({
    fs: {
      ...state.fs,
      loadingContent: true,
      error: undefined
    }
  }))

  const state = getState()
  const current = state.fs.current
  const offset = state.fs.content ? state.fs.content.length : 0
  const search = state.fs.search

  // This should not happen, because the current directory should not be undefined if we are searching its content
  if(!current)
    return setState(state => ({
      fs: {
        ...state.fs,
        loadingContent: false
      }
    })).then(() => {})

  if(search) {
    return Api.fs.search(current.path, search, offset)
      .then((result: SearchResult) => {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            content: (state.fs.content || []).concat(result.items),
            contentSize: (state.fs.content || []).length + result.items.length + (result.hasMore ? 1 : 0),
            error: undefined
          }
        }))
      })
      .catch((e: ApiError) => {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: e
          }
        }))
      })
  } else {
    return Api.fs.getContent(current.id, undefined, offset)
      .then((result: DirectoryWithContent) => {
          setState(state => ({
            fs: {
              ...state.fs,
              loadingContent: false,
              content: (state.fs.content || []).concat(result.content.items),
              contentSize: result.totalContentLength,
              error: undefined
            }
          }))
      })
      .catch((e: ApiError) => {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: e
          }
        }))
      })
  }

}

export const selectNode = ({ setState }: ContextState<State>) => (nodeId: string) => {
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
}

export const selectAllNodes = ({ setState }: ContextState<State>) => () => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'ALL'
      }
    }
  }))
}

export const deselectNode = ({ setState }: ContextState<State>) => (nodeId: string) => {
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
}

export const deselectAllNodes = ({ setState }: ContextState<State>) => () => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'NONE'
      }
    }
  }))
}

export const search = (ctx: ContextState<State>) => (search: Search | undefined) => {
  const { setState } = ctx

  // Update the search state
  setState(state => ({
    fs: {
      ...state.fs,
      content: undefined, // Needed to force a full reload of the search
      search: search
    }
  })).then(() => {
    // Restart the get directory content action, which will take into account the search params we provided
    getDirectoryContent(ctx)
  })

}
