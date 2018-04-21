import { AuthAction } from "auth/AuthActions"
import { InAppNotifAction } from "inAppNotif/InAppNotifActions"
import { FileSystemAction } from "files/fileSystem/FileSystemActions"
import { MoveAction } from "files/move/MoveActions"
import { NewFolderAction } from "files/newFolder/NewFolderActions"
import { RenameAction } from "files/rename/RenameActions"

export type Actions =
  AuthAction |
  InAppNotifAction |
  FileSystemAction |
  MoveAction |
  NewFolderAction |
  RenameAction
