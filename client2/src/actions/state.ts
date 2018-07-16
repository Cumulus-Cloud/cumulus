import FsState from "./fs/fsState"
import CreateDirectoryState from "./fs/directoryCreation/createDirectoryState"
import AuthenticationState from "./user/auth/authenticationState"
import SignInState from "./user/signIn/signInState"
import SignUpState from "./user/signUp/signUpState"
import PopupState from "./popup/popupState"
import FileUploadState from "./fs/fileUpload/fileUploadState"
import SnackbarState from "./snackbar/snackbarState"

export default interface GlobalState {
  auth: AuthenticationState
  signIn: SignInState
  signUp: SignUpState
  fs: FsState
  createDirectory: CreateDirectoryState
  fileUpload: FileUploadState
  popup: PopupState
  snackbar: SnackbarState
}
