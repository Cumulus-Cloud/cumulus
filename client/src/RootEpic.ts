import { combineEpics } from "redux-observable"
import { loginEpics } from "auth/login/LoginEpics"
import { hideInAppNotifEpics } from "inAppNotif/InAppNotifEpics"
import { signupEpics } from "auth/signup/SignupEpics"
import { fileSystemEpics } from "fileSystem/FileSystemEpics"
import { moveEpics } from "move/MoveEpics"
import { createNewFolderEpics } from "newFolder/NewFolderEpics"
import { renameEpics } from "rename/RenameEpics"
import { searchEpics } from "search/SearchEpics"

const RootEpic = combineEpics(
  loginEpics,
  signupEpics,
  fileSystemEpics,
  moveEpics,
  createNewFolderEpics,
  renameEpics,
  searchEpics,
  hideInAppNotifEpics,
)

export default RootEpic
