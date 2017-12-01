import { object, string, optional, union, null as nullable } from "validation.ts"

export const ShareValidator = object({
  id: string,
  reference: string,
  expiration: union(optional(string), nullable),
  owner: string,
  fsNode: string,
  key: string,
})

export type Share = typeof ShareValidator.T
