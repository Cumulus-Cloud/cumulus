import { createAction, ActionType } from "typesafe-actions"
import { FsNode, Compression, Cipher } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { UploadModalStatus } from "models/UploadModalStatus"
import { ApiError } from "models/ApiError"

export const UploadActions = {
  uploaderModalStatus: createAction("UploaderModalStatus", resolve => (status: UploadModalStatus) => resolve({ status })),
  addFiles: createAction("AddFiles", resolve => (files: FileToUpload[]) => resolve({ files })),
  removeFileToUpload: createAction("RemoveFileToUpload", resolve => (fileToUpload: FileToUpload) => resolve({ fileToUpload })),
  uploadFile: createAction("UploadFile", resolve => (path: string, fileToUpload: FileToUpload) => resolve({ path, fileToUpload })),
  uploadFileSuccess: createAction("UploadFileSuccess", resolve => (fsNode: FsNode, fileToUpload: FileToUpload) => resolve({ fsNode, fileToUpload })),
  uploadFileError: createAction("UploadFileError", resolve => (error: ApiError, fileToUpload: FileToUpload) => resolve({ error, fileToUpload })),
  progressUpload: createAction("ProgressUpload", resolve => (progress: number, fileToUpload: FileToUpload) => resolve({ progress, fileToUpload })),
  selectCipher: createAction("SelectCipher", resolve => (fileToUpload: FileToUpload, cipher?: Cipher) => resolve({ fileToUpload, cipher })),
  selectCompression: createAction("SelectCompression",
    resolve => (fileToUpload: FileToUpload, compression?: Compression) => resolve({ fileToUpload, compression })
  ),
}

export type UploadAction = ActionType<typeof UploadActions>
