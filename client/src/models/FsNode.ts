
export type NodeType = "directory" | "file"

export interface FsNode {
  id: string,
  location: string,
  name: string,
  type: NodeType,
  creation: string,
  modification: string
}

export interface Directory extends FsNode {
  content: FsNode[]
}
