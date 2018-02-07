import { object, string, number, optional, array, union, isoDate, boolean, recursion, literal } from "validation.ts"

export const NodeTypeValidator = union("DIRECTORY", "FILE")
export type NodeType = typeof NodeTypeValidator.T

export const CompressionValidator = union("GZIP", "DEFLATE")
export type Compression = typeof CompressionValidator.T

export const CipherValidator = literal("AES")
export type Cipher = typeof CipherValidator.T

export const FsFileValidator = object({
  id: string,
  nodeType: literal("FILE"),
  path: string,
  name: string,
  creation: string,
  modification: string,
  hidden: boolean,
  owner: string,
  size: number,
  humanReadableSize: string,
  hash: string,
  mimeType: string,
  cipher: optional(CipherValidator),
  compression: optional(CompressionValidator),
  hasThumbnail: boolean,
})
export type FsFile = typeof FsFileValidator.T

export interface FsDirectory {
  id: string
  nodeType: "DIRECTORY"
  path: string
  name: string
  creation: string
  modification: string
  hidden: boolean
  owner: string
  content: FsNode[]
}

export const FsDirectoryValidator = recursion<FsFile | FsDirectory>(self => object({
  id: string,
  path: string,
  name: string,
  nodeType: NodeTypeValidator,
  creation: isoDate,
  modification: isoDate,
  hidden: boolean,
  owner: string,
  content: optional(array(self)),
}))

export const FsNodeValidator = union(FsDirectoryValidator, FsFileValidator)

export type FsNode = typeof FsNodeValidator.T

export function isFile(fsNode: FsNode): fsNode is FsFile {
  return (fsNode as FsFile).nodeType === "FILE"
}

export function isDirectory(fsNode: FsNode): fsNode is FsDirectory {
  return (fsNode as FsDirectory).nodeType === "DIRECTORY"
}

export function getExtention(name: string): string {
  return name.split(".").pop() || ""
}

export function isPreviewAvailable(fsFile: FsFile): boolean {
  return videosPreviewAvailable.concat(imagesPreviewAvailable).filter(a => fsFile.name.toLowerCase().endsWith(a)).length > 0
}

export const videosPreviewAvailable = [
  ".mp4",
  ".mkv"
]
export const imagesPreviewAvailable = [
  ".jpg",
  ".png",
  ".jpeg",
  ".gif",
  ".bmp"
]
