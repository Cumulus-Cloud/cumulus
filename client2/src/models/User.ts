
export type Role = 'admin' | 'user'

export interface User {
  id: string
  login: string
  creation: string
  roles: Role[]
}

export function isAdmin(user: User): boolean {
  console.log(user)
  return user.roles.indexOf('admin') >= 0
}
