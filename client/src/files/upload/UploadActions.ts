import { buildAction, ActionsUnion } from "typesafe-actions"
import { FsNode, Compression, Cipher } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { UploadModalStatus } from "models/UploadModalStatus"
import { ApiError } from "models/ApiError"

export const UploadActions = {
  uploaderModalStatus: buildAction("UploaderModalStatus").payload<{ status: UploadModalStatus }>(),
  addFiles: buildAction("AddFiles").payload<{ files: FileToUpload[] }>(),
  removeFileToUpload: buildAction("RemoveFileToUpload").payload<{ fileToUpload: FileToUpload }>(),
  uploadFile: buildAction("UploadFile").payload<{ path: string, fileToUpload: FileToUpload }>(),
  uploadFileSuccess: buildAction("UploadFileSuccess").payload<{ fsNode: FsNode, fileToUpload: FileToUpload }>(),
  uploadFileError: buildAction("UploadFileError").payload<{ error: ApiError, fileToUpload: FileToUpload }>(),
  progressUpload: buildAction("ProgressUpload").payload<{ progress: number, fileToUpload: FileToUpload }>(),
  selectCipher: buildAction("SelectCipher").payload<{ cipher?: Cipher, fileToUpload: FileToUpload }>(),
  selectCompression: buildAction("SelectCompression").payload<{ compression?: Compression, fileToUpload: FileToUpload }>(),
}

export type UploadAction = ActionsUnion<typeof UploadActions>
