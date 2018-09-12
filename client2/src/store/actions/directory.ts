import Api from 'services/api'

import { ApiError } from 'models/ApiError'
import { Directory, DirectoryWithContent, SearchResult } from 'models/FsNode'

import { createAction, createPureAction } from 'store/actions'
import { Search } from 'store/states/fsState'


export const getDirectory = createAction<string>((path, setState, _, dispatch) => {
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

  return Api.fs.getDirectory(path).then((result: ApiError | Directory) => {
    if ('errors' in result) {
      setState({
        fs: {
          loadingCurrent: false,
          loadingContent: false,
          selectedContent: { type: 'NONE' },
          error: result
        }
      })

      return Promise.resolve()
    } else {
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

      return dispatch(getDirectoryContent()).then(() => { })
    }
  })

})

export const getDirectoryContent = createPureAction((setState, getState) => {
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
    return Api.fs.search(current.path, search, offset).then((result: ApiError | SearchResult) => {
      if ('errors' in result) {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: result
          }
        }))
      } else {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            content: (state.fs.content || []).concat(result.items),
            contentSize: (state.fs.content || []).length + result.items.length + (result.hasMore ? 1 : 0),
            error: undefined
          }
        }))
      }

    })
  } else {
    return Api.fs.getContent(current.id, offset).then((result: ApiError | DirectoryWithContent) => {
      if ('errors' in result) {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            error: result
          }
        }))
      } else {
        setState(state => ({
          fs: {
            ...state.fs,
            loadingContent: false,
            content: (state.fs.content || []).concat(result.content.items),
            contentSize: result.totalContentLength,
            error: undefined
          }
        }))
      }
  
    })
  }

})

export const selectNode = createAction<string>((nodeId, setState) => {
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
})

export const selectAllNodes = createPureAction((setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'ALL'
      }
    }
  }))
})

export const deselectNode = createAction<string>((nodeId, setState) => {
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
})

export const deselectAllNodes = createPureAction((setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      selectedContent: {
        type: 'NONE'
      }
    }
  }))
})

export const showNodeDetails = createAction<string>((nodeId, setState) => {
  setState(state => ({
    fs: {
      ...state.fs,
      detailed: (state.fs.content || []).find((node) => node.id === nodeId)
    }
  }))
})

export const search = createAction<Search | undefined>((search, setState, _, dispatch) => {
  // Update the search state
  return setState(state => ({
    fs: {
      ...state.fs,
      content: undefined, // Needed to force a full reload of the search
      search: search
    }
  })).then(() => {
    // Restart the get directory content action, which will take into account the search params we provided
    return dispatch(getDirectoryContent()).then(() => {})
  })

})