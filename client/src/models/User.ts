import { object, string, array, union } from "validation.ts"

export const role = union("admin", "user")
export type Role = typeof role.T

export const UserValidator = object({
  id: string,
  login: string,
  creation: string,
  roles: array(role)
})

export type User = typeof UserValidator.T
