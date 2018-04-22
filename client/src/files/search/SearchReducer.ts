import { getType } from "typesafe-actions"
import { SearchActions } from "./SearchActions"
import { SearchResult } from "models/Search"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

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

export const SearchReducer = (state: SearchState = initState, action: Actions): SearchState => {
  switch (action.type) {
    case getType(SearchActions.queryChange): return { ...state, query: action.payload.query }
    case getType(SearchActions.searchSuccess): return {
      ...state,
      searchResult: state.query ? action.payload.searchResult : undefined,
      loading: false
    }
    case getType(SearchActions.searchError): return { ...state, error: action.payload.error, loading: false }
    case getType(SearchActions.cancelSearch): return { ...state, searchResult: undefined }
    case getType(SearchActions.fsNodeSearch): return { ...state, loading: true }
    default: return state
  }
}
