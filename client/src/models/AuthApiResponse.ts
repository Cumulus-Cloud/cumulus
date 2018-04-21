import { UserValidator } from "models/User"
import { object, string } from "validation.ts"

export const AuthApiResponseValidator = object({
  user: UserValidator,
  token: string
})

export type AuthApiResponse = typeof AuthApiResponseValidator.T
