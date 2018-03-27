import { Reducer, createStore, combineReducers, applyMiddleware } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import createHashHistory from "history/createHashHistory"
import { RouterState, routerReducer, routerMiddleware } from "react-router-redux"
import { createEpicMiddleware } from "redux-observable"
import { LoginState, LoginReducer } from "auth/login/LoginReducer"
import { SignupState, SignupReducer } from "auth/signup/SignupReducer"
import { FileSystemState, FileSystemReducer } from "files/fileSystem/FileSystemReducer"
import { NewFolderState, NewFolderReducer } from "files/newFolder/NewFolderReducer"
import { UploadState, UploadReducer } from "files/upload/UploadReducer"
import { SearchState, SearchReducer } from "files/search/SearchReducer"
import { MoveState, MoveReducer } from "files/move/MoveReducer"
import { RenameState, RenameReducer } from "files/rename/RenameReducer"
import { InAppNotifState, InAppNotifReducer } from "inAppNotif/InAppNotifReducer"
import RootEpic from "RootEpic"

export interface GlobalState {
  login: LoginState
  signup: SignupState
  newFolder: NewFolderState
  upload: UploadState
  fileSystem: FileSystemState
  search: SearchState
  move: MoveState
  rename: RenameState
  inAppNotif: InAppNotifState
  router: Reducer<RouterState>
}

export const history = createHashHistory()
const middleware = routerMiddleware(history)
const epicMiddleware = createEpicMiddleware(RootEpic)

const reducers = combineReducers({
  // tslint:disable-next-line:no-any
  login: LoginReducer as any,
  // tslint:disable-next-line:no-any
  signup: SignupReducer as any,
  newFolder: NewFolderReducer,
  upload: UploadReducer as any,
  fileSystem: FileSystemReducer,
  search: SearchReducer,
  move: MoveReducer,
  rename: RenameReducer,
  inAppNotif: InAppNotifReducer,
  router: routerReducer,
})
const enhancer = composeWithDevTools(
  applyMiddleware(epicMiddleware),
  applyMiddleware(middleware),
)
export const store = createStore(reducers, enhancer)
