import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { FsNodeSearch, SearchError, onSearchSuccess, onSearchError } from "files/search/SearchActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const searchEpic: Epic<any, GlobalState> = (action$: ActionsObservable<FsNodeSearch>) => action$.ofType("FsNodeSearch")
    .mergeMap(action =>
      Api.search(action.query)
        .then(onSearchSuccess)
        .catch(onSearchError)
    )

export const searchErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<SearchError>) => action$.ofType("SearchError")
    .map(action => showApiErrorNotif(action.error))

export const searchEpics = combineEpics(
  searchEpic, searchErrorEpic,
)
