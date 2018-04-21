import { AuthAction } from "auth/AuthActions"
import { InAppNotifAction } from "inAppNotif/InAppNotifActions"
import { FileSystemAction } from "files/fileSystem/FileSystemActions"

export type Actions =
  AuthAction |
  InAppNotifAction |
  FileSystemAction
