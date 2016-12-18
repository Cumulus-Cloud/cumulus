import { ValidationErrors, validate } from "./validation"

export type Role = "admin" | "user"

export interface Account {
  id: string
  login: string
  creation: string
  roles: Role[]
}

export interface AccountLogin {
  mail: string,
  password: string
}

export function validateLogin(login: AccountLogin): ValidationErrors<AccountLogin> | undefined {
  const constraints = {
    mail: {
      email: true,
    },
    password: {
      presence: true,
    }
  }
  return validate(login, constraints)
}
