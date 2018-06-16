import UserState from "./user/userState"
import FsState from "./fs/fsState"

export default interface GlobalState {
  user: UserState
  fs: FsState
}
