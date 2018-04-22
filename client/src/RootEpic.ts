import { combineEpics } from "redux-observable"
import { authEpics } from "auth/AuthEpics"
import { hideInAppNotifEpics } from "inAppNotif/InAppNotifEpics"
import { fileSystemEpics } from "files/fileSystem/FileSystemEpics"
import { moveEpics } from "files/move/MoveEpics"
import { createNewFolderEpics } from "files/newFolder/NewFolderEpics"
import { renameEpics } from "files/rename/RenameEpics"
import { searchEpics } from "files/search/SearchEpics"
import { uploadEpics } from "files/upload/UploadEpics"

const RootEpic = combineEpics(
  authEpics,
  fileSystemEpics,
  moveEpics,
  createNewFolderEpics,
  renameEpics,
  searchEpics,
  uploadEpics,
  hideInAppNotifEpics,
)

export default RootEpic
