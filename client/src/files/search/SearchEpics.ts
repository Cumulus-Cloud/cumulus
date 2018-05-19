import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, mergeMap, map, catchError } from "rxjs/operators"
import { Actions } from "actions"
import { GlobalState, Dependencies } from "store"
import { SearchActions } from "files/search/SearchActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const searchEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(SearchActions.fsNodeSearch)),
  mergeMap(({ payload: { query } }) => requests.search(query).pipe(
    map(SearchActions.searchSuccess),
    catchError((error: ApiError) => of(SearchActions.searchError(error))),
  ))
)

export const searchErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(SearchActions.searchError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const searchEpics = combineEpics(
  searchEpic, searchErrorEpic,
)
