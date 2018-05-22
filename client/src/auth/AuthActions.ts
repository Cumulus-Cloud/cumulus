import { createAction, ActionType } from "typesafe-actions"

import { AuthApiResponse } from "models/AuthApiResponse"
import { ApiError } from "models/ApiError"

export const AuthActions = {
  logout: createAction("Logout"),
  loginChange: createAction("LoginChange", resolve => (field: string, value: string) => resolve({ field, value })),
  loginSubmit: createAction("LoginSubmit", resolve => (login: string, password: string) => resolve({ login, password })),
  loginSubmitSuccess: createAction("LoginSubmitSuccess", resolve => (auth: AuthApiResponse) => resolve({ auth })),
  loginSubmitError: createAction("LoginSubmitError", resolve => (error: ApiError) => resolve({ error })),
  signupChange: createAction("SignupChange", resolve => (field: string, value: string) => resolve({ field, value })),
  signupSubmit: createAction("SignupSubmit", resolve => (login: string, email: string, password: string) => resolve({ login, email, password })),
  signupSubmitSuccess: createAction("SignupSubmitSuccess", resolve => (auth: AuthApiResponse) => resolve({ auth })),
  signupSubmitError: createAction("SignupSubmitError", resolve => (error: ApiError) => resolve({ error })),
}

export type AuthAction = ActionType<typeof AuthActions>
