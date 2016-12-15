
export type Role = "admin" | "user"

export interface Account {
  id: string
  login: string
  creation: string
  roles: Role[]
}
