import { Reducer, createStore, combineReducers, applyMiddleware } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { composeWithDevTools } from "redux-devtools-extension"
import createHashHistory from "history/createHashHistory"
import { RouterState, routerReducer, routerMiddleware } from "react-router-redux"
import { createEpicMiddleware } from "redux-observable"

import { InAppNotifState, InAppNotifReducer } from "inAppNotif/InAppNotifReducer"
import ParametresRootEpic from "parametres/ParametresRootEpic"
// import { createApiInstance, Requests } from "services/Api"

export interface GlobalState {
  inAppNotif: InAppNotifState
  router: Reducer<RouterState>
}

// export interface Dependencies {
//   requests: Requests
// }

export const history = createHashHistory()
const middleware = routerMiddleware(history)

// const dependencies: Dependencies = {
//   requests: createApiInstance()
// }
const epicMiddleware = createEpicMiddleware(ParametresRootEpic, { })

const reducers = combineReducers({
  inAppNotif: InAppNotifReducer,
  router: routerReducer,
})
const enhancer = composeWithDevTools(
  applyMiddleware(epicMiddleware),
  applyMiddleware(middleware),
)

const persistConfig = {
  key: "parametres-root",
  storage,
  whitelist: []
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = createStore(persistedReducer, enhancer)
export const persistor = persistStore(store)
