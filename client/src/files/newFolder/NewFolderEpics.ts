import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import {
  CreateNewFolder, createNewFolderSuccess, createNewFolderError, CreateNewFolderError
} from "files/newFolder/NewFolderActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const createNewFolderEpic: EpicType = (
  action$: ActionsObservable<CreateNewFolder>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("CreateNewFolder")
    .mergeMap(({ currentDirectory, newFolderName }) =>
      dependencies.requests.createFnNode(currentDirectory, newFolderName, "DIRECTORY")
        .map(createNewFolderSuccess)
        .catch((error: ApiError) => Observable.of(createNewFolderError(error)))
    )
}

export const createNewFolderErrorEpic: EpicType = (action$: ActionsObservable<CreateNewFolderError>) => {
  return action$
    .ofType("CreateNewFolderError")
    .map(action => showApiErrorNotif(action.error))
}

export const createNewFolderEpics = combineEpics(
  createNewFolderEpic, createNewFolderErrorEpic,
)
