import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { CreateNewFolder, createNewFolderSuccess, createNewFolderError, CreateNewFolderError } from "files/newFolder/NewFolderActions"

export const createNewFolderEpic: Epic<any, GlobalState> = (action$: ActionsObservable<CreateNewFolder>) => action$.ofType("CreateNewFolder")
    .mergeMap(action =>
      Api.createFnNode(action.currentDirectory, action.newFolderName, "DIRECTORY")
        .then(createNewFolderSuccess)
        .catch(createNewFolderError)
    )

export const createNewFolderErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<CreateNewFolderError>) => {
    return action$
        .ofType("CreateNewFolderError")
        .map(action => showApiErrorNotif(action.error));
}

export const createNewFolderEpics = combineEpics(
  createNewFolderEpic, createNewFolderErrorEpic,
)
