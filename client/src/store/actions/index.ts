import { createAction as createActionRaw, createPureAction as createPureActionRaw, ActionFactory, ActionFactoryParameter, PureActionFactoryParameter, PureActionFactory } from 'utils/store'

import { State } from 'store/store'

export const createAction = <T>(action: ActionFactoryParameter<T, State>): ActionFactory<T, State> => createActionRaw<T, State>(action)
export const createPureAction = (action: PureActionFactoryParameter<State>): PureActionFactory<State> => createPureActionRaw<State>(action)
