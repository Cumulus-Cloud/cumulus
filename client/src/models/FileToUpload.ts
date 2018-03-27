import { Compression, Cipher, FsDirectory } from "models/FsNode"

export interface FileToUpload {
  id: string
  name: string
  progress: number
  loading: boolean
  done: boolean
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
      name: file.name,
      progress: 0,
      loading: false,
      file,
      done: false,
      directory
    }
  })
}
