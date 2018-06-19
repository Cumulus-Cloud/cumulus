import FsState from "./fs/fsState"
import AuthenticationState from "./user/auth/authenticationState"
import SignInState from "./user/signIn/signInState"
import SignUpState from "./user/signUp/signUpState"

export default interface GlobalState {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
}
