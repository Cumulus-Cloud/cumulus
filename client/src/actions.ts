import { AuthAction } from "auth/AuthActions"
import { InAppNotifAction } from "inAppNotif/InAppNotifActions"
import { FileSystemAction } from "files/fileSystem/FileSystemActions"
import { MoveAction } from "files/move/MoveActions"

export type Actions =
  AuthAction |
  InAppNotifAction |
  FileSystemAction |
  MoveAction
