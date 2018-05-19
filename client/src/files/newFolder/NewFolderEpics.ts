import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, mergeMap, map, catchError } from "rxjs/operators"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { NewFolderActions } from "files/newFolder/NewFolderActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const createNewFolderEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(NewFolderActions.createNewFolder)),
  mergeMap(({ payload: { currentDirectory, newFolderName } }) => requests.createFnNode(currentDirectory, newFolderName, "DIRECTORY").pipe(
    map(newFolder => NewFolderActions.createNewFolderSuccess({ newFolder })),
    catchError((error: ApiError) => of(NewFolderActions.createNewFolderError({ error })))
  ))
)

export const createNewFolderErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(NewFolderActions.createNewFolderError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const createNewFolderEpics = combineEpics(
  createNewFolderEpic, createNewFolderErrorEpic,
)
