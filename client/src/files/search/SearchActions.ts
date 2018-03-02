import { ApiError } from "services/Api"
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
export function onFsNodeSearch(query: string): FsNodeSearch {
  return { type: "FsNodeSearch", query }
}

export type SearchSuccess = { type: "SearchSuccess", searchResult: SearchResult }
export const onSearchSuccess = (searchResult: SearchResult): SearchSuccess => ({ type: "SearchSuccess", searchResult })

export type SearchError = { type: "SearchError", error: ApiError }
export const onSearchError = (error: ApiError): SearchError => ({ type: "SearchError", error })

export type CancelSearch = { type: "CancelSearch" }
export const onCancelSearch = (): CancelSearch => ({ type: "CancelSearch" })
