export type Role = "admin" | "user"

export interface User {
  id: string
  login: string
  creation: string
  roles: Role[]
}
