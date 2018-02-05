import { object, number, array } from "validation.ts"
import { FsNodeValidator } from "models/FsNode"

export const SearchResultValidator = object({
  items: array(FsNodeValidator),
  size: number,
})

export type SearchResult = typeof SearchResultValidator.T
