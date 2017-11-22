import { object, string, optional, array, union, isoDate, boolean, recursion } from "validation.ts"

export const NodeTypeValidator = union("DIRECTORY", "FILE")
export type NodeType = typeof NodeTypeValidator.T

export type FsNode = {
  id: string,
  path: string,
  nodeType: NodeType,
  creation: string,
  modification: string,
  hidden: boolean,
  owner: string,
  content: FsNode[],
}

export const FsNodeValidator = recursion<FsNode>(self => object({
  id: string,
  path: string,
  nodeType: NodeTypeValidator,
  creation: isoDate,
  modification: isoDate,
  hidden: boolean,
  owner: string,
  content: optional(array(self)),
}))
