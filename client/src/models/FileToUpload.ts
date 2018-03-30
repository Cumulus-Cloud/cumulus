import { Compression, Cipher, FsDirectory } from "models/FsNode"

export type FileStatus = "Ready" | "Loading" | "Done"

export interface FileToUpload {
  id: string
  fileStatus: FileStatus
  name: string
  progress: number
  file: File
  directory: FsDirectory
  compression?: Compression
  cipher?: Cipher
}

export function fileListToArray(filesList: FileList): File[] {
  const files: File[] = []
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < filesList.length; i++) {
    files.push(filesList[i])
  }
  return files
}

export function fromFileList(filesList: FileList, directory: FsDirectory): FileToUpload[] {
  return fileListToArray(filesList).map(file => {
    return {
      id: file.name,
      fileStatus: "Ready",
      name: file.name,
      progress: 0,
      file,
      directory
    } as FileToUpload
  })
}
