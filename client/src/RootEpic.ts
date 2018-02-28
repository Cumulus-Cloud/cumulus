import { combineEpics } from "redux-observable"
import { loginEpics } from "auth/login/LoginEpics"
import { hideInAppNotifEpics } from "inAppNotif/InAppNotifEpics"
import { signupEpics } from "auth/signup/SignupEpics"
import { fileSystemEpics } from "fileSystem/FileSystemEpics"
import { moveEpics } from "move/MoveEpics"

const RootEpic = combineEpics(
  loginEpics,
  signupEpics,
  fileSystemEpics,
  moveEpics,
  hideInAppNotifEpics,
)

export default RootEpic
