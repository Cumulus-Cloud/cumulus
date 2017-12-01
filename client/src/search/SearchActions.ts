import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { SearchResult } from "models/Search"

export type SearchAction =
  QueryChange |
  FsNodeSearch |
  SearchSuccess |
  SearchError |
  CancelSearch

export type QueryChange = { type: "QueryChange", query: string }
export const onQueryChange = (query: string): QueryChange => ({ type: "QueryChange", query })

export type FsNodeSearch = { type: "FsNodeSearch", query: string }
export function onFsNodeSearch(query: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "FsNodeSearch", query })
    Api.search(query)
      .then(searchResult => dispatch(onSearchSuccess(searchResult)))
      .catch(error => dispatch(onSearchError(error)))
  }
}

export type SearchSuccess = { type: "SearchSuccess", searchResult: SearchResult }
export const onSearchSuccess = (searchResult: SearchResult): SearchSuccess => ({ type: "SearchSuccess", searchResult })

export type SearchError = { type: "SearchError", error: Api.ApiError }
export const onSearchError = (error: Api.ApiError): SearchError => ({ type: "SearchError", error })

export type CancelSearch = { type: "CancelSearch" }
export const onCancelSearch = (): CancelSearch => ({ type: "CancelSearch" })
