
export interface FsCommon {
  id: string
  location: string
  name: string
  creation: string
  modification: string
}

export interface File extends FsCommon {
  type: "file",
}

export interface Directory extends FsCommon {
  type: "directory"
  content: FsNode[]
}

export type FsNode = Directory | File
