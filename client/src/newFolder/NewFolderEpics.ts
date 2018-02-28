import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import * as NewFolderActions from "newFolder/NewFolderActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

export const createNewFolderEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("OnCreateNewFolder")
    .mergeMap(action =>
      Api.createFnNode(`${action.currentDirectory.path}/${action.newFolderName}`, "DIRECTORY")
        .then(NewFolderActions.onCreateNewFolderSuccess)
        .catch(NewFolderActions.onCreateNewFolderError)
    )

export const createNewFolderErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("OnCreateNewFolderError")
    .map((action: NewFolderActions.OnCreateNewFolderError) => showErrorNotif(action.error.message))

export const createNewFolderEpics = combineEpics(
  createNewFolderEpic, createNewFolderErrorEpic,
)
