import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { FsNodeSearch, SearchError, onSearchSuccess, onSearchError } from "search/SearchActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

export const searchEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("FsNodeSearch")
    .mergeMap((action: FsNodeSearch) =>
      Api.search(action.query)
        .then(onSearchSuccess)
        .catch(onSearchError)
    )

export const searchErrorEpic: Epic<any, GlobalState> = (action$) => action$.ofType("SearchError")
    .map((action: SearchError) => showErrorNotif(action.error.message))

export const searchEpics = combineEpics(
  searchEpic, searchErrorEpic,
)
