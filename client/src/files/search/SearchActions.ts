import { createAction, ActionType } from "typesafe-actions"
import { SearchResult } from "models/Search"
import { ApiError } from "models/ApiError"

export const SearchActions = {
  queryChange: createAction("QueryChange", resolve => (query: string) => resolve({ query })),
  fsNodeSearch: createAction("FsNodeSearch", resolve => (query: string) => resolve({ query })),
  searchSuccess: createAction("SearchSuccess", resolve => (searchResult: SearchResult) => resolve({ searchResult })),
  searchError: createAction("SearchError", resolve => (error: ApiError) => resolve({ error })),
  cancelSearch: createAction("CancelSearch"),
}

export type SearchAction = ActionType<typeof SearchActions>
