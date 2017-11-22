import { object, string, array, union, isoDate, boolean } from "validation.ts"

export const NodeTypeValidator = union("DIRECTORY", "FILE")
export type NodeType = typeof NodeTypeValidator.T

export const FsNodeValidator = object({
  id: string,
  path: string,
  nodeType: NodeTypeValidator,
  creation: isoDate,
  modification: isoDate,
  hidden: boolean,
  owner: string,
  permissions: array(object({})), // TODO
  content: array(object({})), // TODO
})

export type FsNode = typeof FsNodeValidator.T
