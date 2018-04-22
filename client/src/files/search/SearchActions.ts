import { Action } from "redux"
import { SearchResult } from "models/Search"
import { ApiError } from "models/ApiError"

export type SearchAction =
  QueryChange |
  FsNodeSearch |
  SearchSuccess |
  SearchError |
  CancelSearch

export interface QueryChange extends Action {
  type: "QueryChange"
  query: string
}
export function onQueryChange(query: string): QueryChange {
  return { type: "QueryChange", query }
}

export interface FsNodeSearch extends Action {
  type: "FsNodeSearch"
  query: string
}
export function onFsNodeSearch(query: string): FsNodeSearch {
  return { type: "FsNodeSearch", query }
}

export interface SearchSuccess extends Action {
  type: "SearchSuccess"
  searchResult: SearchResult
}
export function onSearchSuccess(searchResult: SearchResult): SearchSuccess {
  return { type: "SearchSuccess", searchResult }
}

export interface SearchError extends Action {
  type: "SearchError"
  error: ApiError
}
export function onSearchError(error: ApiError): SearchError {
  return { type: "SearchError", error }
}

export interface CancelSearch extends Action {
  type: "CancelSearch"
}
export function onCancelSearch(): CancelSearch {
  return { type: "CancelSearch" }
}
