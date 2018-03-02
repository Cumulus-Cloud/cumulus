import { combineEpics } from "redux-observable"
import { loginEpics } from "auth/login/LoginEpics"
import { hideInAppNotifEpics } from "inAppNotif/InAppNotifEpics"
import { signupEpics } from "auth/signup/SignupEpics"
import { fileSystemEpics } from "files/fileSystem/FileSystemEpics"
import { moveEpics } from "files/move/MoveEpics"
import { createNewFolderEpics } from "files/newFolder/NewFolderEpics"
import { renameEpics } from "files/rename/RenameEpics"
import { searchEpics } from "search/SearchEpics"
import { uploadEpics } from "files/upload/UploadEpics"

const RootEpic = combineEpics(
  loginEpics,
  signupEpics,
  fileSystemEpics,
  moveEpics,
  createNewFolderEpics,
  renameEpics,
  searchEpics,
  uploadEpics,
  hideInAppNotifEpics,
)

export default RootEpic
