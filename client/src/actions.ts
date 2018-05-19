import { RouterAction } from "react-router-redux"
import { AuthAction } from "auth/AuthActions"
import { InAppNotifAction } from "inAppNotif/InAppNotifActions"
import { FileSystemAction } from "files/fileSystem/FileSystemActions"
import { MoveAction } from "files/move/MoveActions"
import { NewFolderAction } from "files/newFolder/NewFolderActions"
import { RenameAction } from "files/rename/RenameActions"
import { SearchAction } from "files/search/SearchActions"
import { UploadAction } from "files/upload/UploadActions"

export type Actions =
  RouterAction |
  AuthAction |
  InAppNotifAction |
  FileSystemAction |
  MoveAction |
  NewFolderAction |
  RenameAction |
  SearchAction |
  UploadAction
