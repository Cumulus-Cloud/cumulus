import { Reducer, createStore, combineReducers, applyMiddleware } from "redux"
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { composeWithDevTools } from "redux-devtools-extension"
import createHashHistory from "history/createHashHistory"
import { RouterState, routerReducer, routerMiddleware } from "react-router-redux"
import { createEpicMiddleware } from "redux-observable"
import { AuthState, AuthReducer } from "auth/AuthReducer"
import { FileSystemState, FileSystemReducer } from "files/fileSystem/FileSystemReducer"
import { NewFolderState, NewFolderReducer } from "files/newFolder/NewFolderReducer"
import { UploadState, UploadReducer } from "files/upload/UploadReducer"
import { SearchState, SearchReducer } from "files/search/SearchReducer"
import { MoveState, MoveReducer } from "files/move/MoveReducer"
import { RenameState, RenameReducer } from "files/rename/RenameReducer"
import { InAppNotifState, InAppNotifReducer } from "inAppNotif/InAppNotifReducer"
import RootEpic from "RootEpic"
import { createApiInstance, Requests } from "services/Api"

export interface GlobalState {
  auth: AuthState
  newFolder: NewFolderState
  upload: UploadState
  fileSystem: FileSystemState
  search: SearchState
  move: MoveState
  rename: RenameState
  inAppNotif: InAppNotifState
  router: Reducer<RouterState>
}

export interface Dependencies {
  requests: Requests
}

const requests = createApiInstance("http://localhost:9000")

export const history = createHashHistory()
const middleware = routerMiddleware(history)
const dependencies: Dependencies = {
  requests
}
const epicMiddleware = createEpicMiddleware(RootEpic, { dependencies })

const reducers = combineReducers({
  auth: AuthReducer,
  newFolder: NewFolderReducer,
  upload: UploadReducer,
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

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"]
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = createStore(persistedReducer, enhancer)
export const persistor = persistStore(store)
