import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { Actions } from "actions"
import { GlobalState, Dependencies } from "store"
import { FsNodeSearch, SearchError, onSearchSuccess, onSearchError } from "files/search/SearchActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const searchEpic: EpicType = (
  action$: ActionsObservable<FsNodeSearch>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("FsNodeSearch")
    .mergeMap(({ query }) =>
      dependencies.requests.search(query)
        .map(onSearchSuccess)
        .catch((error: ApiError) => Observable.of(onSearchError(error)))
    )
}

export const searchErrorEpic: EpicType = (action$: ActionsObservable<SearchError>) => {
  return action$.ofType("SearchError")
    .map(action => showApiErrorNotif(action.error))
}

export const searchEpics = combineEpics(
  searchEpic, searchErrorEpic,
)
