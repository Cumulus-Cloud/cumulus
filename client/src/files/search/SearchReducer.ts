import { SearchAction } from "./SearchActions"
import { SearchResult } from "models/Search"
import { ApiError } from "models/ApiError"

export interface SearchState {
  query: string
  loading: boolean
  error?: ApiError
  searchResult?: SearchResult
}

const initState: SearchState = {
  loading: false,
  query: "",
}

export const SearchReducer = (state: SearchState = initState, action: SearchAction): SearchState => {
  switch (action.type) {
    case "QueryChange": return { ...state, query: action.query }
    case "SearchSuccess": return { ...state, searchResult: state.query ? action.searchResult : undefined, loading: false }
    case "SearchError": return { ...state, error: action.error, loading: false }
    case "CancelSearch": return { ...state, searchResult: undefined }
    case "FsNodeSearch": return { ...state, loading: true }
    default: return state
  }
}
