import { AuthApiResponse } from "models/AuthApiResponse"
import { ApiError } from "models/ApiError"
import { buildAction, ActionsUnion } from "typesafe-actions"

export const AuthActions = {
  logout: buildAction("Logout").empty(),
  loginChange: buildAction("LoginChange").payload<{ field: string, value: string }>(),
  loginSubmit: buildAction("LoginSubmit").payload<{ login: string, password: string }>(),
  loginSubmitSuccess: buildAction("LoginSubmitSuccess").payload<{ auth: AuthApiResponse }>(),
  loginSubmitError: buildAction("LoginSubmitError").payload<{ error: ApiError }>(),
  signupChange: buildAction("SignupChange").payload<{ field: string, value: string }>(),
  signupSubmit: buildAction("SignupSubmit").payload<{ login: string, email: string, password: string }>(),
  signupSubmitSuccess: buildAction("SignupSubmitSuccess").payload<{ auth: AuthApiResponse }>(),
  signupSubmitError: buildAction("SignupSubmitError").payload<{ error: ApiError }>(),
}

export type AuthAction = ActionsUnion<typeof AuthActions>
