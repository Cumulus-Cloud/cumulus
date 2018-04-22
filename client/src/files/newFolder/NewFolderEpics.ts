import { isActionOf } from "typesafe-actions"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { NewFolderActions } from "files/newFolder/NewFolderActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const createNewFolderEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(NewFolderActions.createNewFolder))
    .mergeMap(({ payload: { currentDirectory, newFolderName } }) =>
      dependencies.requests.createFnNode(currentDirectory, newFolderName, "DIRECTORY")
        .map(newFolder => NewFolderActions.createNewFolderSuccess({ newFolder }))
        .catch((error: ApiError) => Observable.of(NewFolderActions.createNewFolderError({ error })))
    )
}

export const createNewFolderErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(NewFolderActions.createNewFolderError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const createNewFolderEpics = combineEpics(
  createNewFolderEpic, createNewFolderErrorEpic,
)
