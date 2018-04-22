import { isActionOf } from "typesafe-actions"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics } from "redux-observable"
import { Actions } from "actions"
import { GlobalState, Dependencies } from "store"
import { SearchActions } from "files/search/SearchActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const searchEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(SearchActions.fsNodeSearch))
    .mergeMap(({ payload: { query } }) =>
      dependencies.requests.search(query)
        .map(searchResult => SearchActions.searchSuccess({ searchResult }))
        .catch((error: ApiError) => Observable.of(SearchActions.searchError({ error })))
    )
}

export const searchErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(SearchActions.searchError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const searchEpics = combineEpics(
  searchEpic, searchErrorEpic,
)
