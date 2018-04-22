import { buildAction, ActionsUnion } from "typesafe-actions"
import { SearchResult } from "models/Search"
import { ApiError } from "models/ApiError"

export const SearchActions = {
  queryChange: buildAction("QueryChange").payload<{ query: string }>(),
  fsNodeSearch: buildAction("FsNodeSearch").payload<{ query: string }>(),
  searchSuccess: buildAction("SearchSuccess").payload<{ searchResult: SearchResult }>(),
  searchError: buildAction("SearchError").payload<{ error: ApiError }>(),
  cancelSearch: buildAction("CancelSearch").empty(),
}

export type SearchAction = ActionsUnion<typeof SearchActions>
