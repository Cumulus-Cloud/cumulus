// import { ValidationErrors, validate } from "./validation"

export type Role = "admin" | "user"

export interface Account {
  id: string
  login: string
  creation: string
  roles: Role[]
}
/*
export interface AccountSignup {
  login: string
  mail: string,
  password: string
}

export interface AccountLogin {
  mail: string,
  password: string
}

const loginConstraints = {
  mail: {
    email: {
      message: "invalid"
    },
  },
  password: {
    presence: {
      message: "invalid"
    },
  }
}
export function validateLogin(login: AccountLogin): ValidationErrors<AccountLogin> | undefined {
  return validate(login, loginConstraints)
}

const signupConstraints = {
  login: {
    presence: {
      message: "required"
    },
  },
  mail: {
    email: {
      message: "invalid"
    },
  },
  password: {
    presence: {
      message: "required"
    },
  }
}
export function validateSignup(signup: AccountSignup): ValidationErrors<AccountSignup> | undefined {
  return validate(signup, signupConstraints)
}
*/
