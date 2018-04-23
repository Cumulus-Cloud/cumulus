import { buildAction, ActionsUnion } from "typesafe-actions"
import { ApiError } from "models/ApiError"
import { SharingApiResponse, SharingItem } from "models/Sharing"

export const SharedFilesActions = {
  fetchSharedFiles: buildAction("FetchSharedFiles").empty(),
  fetchSharedFilesSuccess: buildAction("FetchSharedFilesSuccess").payload<{ sharingApiResponse: SharingApiResponse }>(),
  fetchSharedFilesError: buildAction("FetchSharedFilesError").payload<{ error: ApiError }>(),
  deleteSharedFile: buildAction("DeleteSharedFile").payload<{ sharing: SharingItem }>(),
  deleteSharedFileSuccess: buildAction("DeleteSharedFileSuccess").payload<{ sharing: SharingItem }>(),
  deleteSharedFileError: buildAction("DeleteSharedFileError").payload<{ error: ApiError }>(),
}

export type SharedFilesAction = ActionsUnion<typeof SharedFilesActions>
