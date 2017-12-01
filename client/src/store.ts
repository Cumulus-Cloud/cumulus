import { Reducer } from "redux"
import { RouterState } from "react-router-redux"
import { composeWithDevTools } from "redux-devtools-extension"
import createHashHistory from "history/createHashHistory"
import { createStore, combineReducers, applyMiddleware } from "redux"
import { routerReducer, routerMiddleware } from "react-router-redux"
import thunkMiddleware from "redux-thunk"
import { LoginState, LoginReducer } from "auth/login/LoginReducer"
import { SignupState, SignupReducer } from "auth/signup/SignupReducer"
import { DirectoriesState, DirectoriesReducer } from "directories/DirectoriesReducer"
import { NewFolderState, NewFolderReducer } from "newFolder/NewFolderReducer"
import { UploadState, UploadReducer } from "upload/UploadReducer"
import { SearchState, SearchReducer } from "search/SearchReducer"

export interface GlobalState {
  login: LoginState
  signup: SignupState
  newFolder: NewFolderState
  upload: UploadState
  directories: DirectoriesState
  search: SearchState
  router: Reducer<RouterState>
}

export const history = createHashHistory()
const middleware = routerMiddleware(history)

const reducers = combineReducers({
  login: LoginReducer as any,
  signup: SignupReducer as any,
  newFolder: NewFolderReducer,
  upload: UploadReducer,
  directories: DirectoriesReducer as any,
  search: SearchReducer as any,
  router: routerReducer,
})
const enhancer = composeWithDevTools(
  applyMiddleware(thunkMiddleware),
  applyMiddleware(middleware),
)
export const store = createStore(reducers, enhancer)
