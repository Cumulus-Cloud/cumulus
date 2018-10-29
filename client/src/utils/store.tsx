import  React from 'react'
import { ComponentType } from 'react'

import { Difference } from 'utils/types'

// Helpers
export type StateUpdater<S> = (update: ((s: S) => Partial<S>) | Partial<S>) => Promise<S>
export type StateReader<S> = () => Readonly<S>
export type Dispatcher<S> = (action: Action<S>) => Promise<S>

// Actions type
export type Action<S> = (setState: StateUpdater<S>, getState: StateReader<S>, dispatch: Dispatcher<S>) => void | Promise<void> 
export type ActionFactory<T, S> = (param :T) => Action<S>
export type PureActionFactory<S> = () => Action<S>
export type ActionFactoryParameter<T, S> = (param :T, setState: StateUpdater<S>, getState: StateReader<S>, dispatch: Dispatcher<S>) => void | Promise<void>
export type PureActionFactoryParameter<S> = (setState: StateUpdater<S>, getState: StateReader<S>, dispatch: Dispatcher<S>) => void | Promise<void>

// Helper to create actions
export function createAction<T, S>(action: ActionFactoryParameter<T, S>): (param :T) => Action<S> {
  return (param: T) => (setState: StateUpdater<S>, getState: StateReader<S>, dispatch: Dispatcher<S>) => action(param, setState, getState, dispatch)
}
export function createPureAction<S>(action: PureActionFactoryParameter<S>): () => Action<S> {
  return () => (setState: StateUpdater<S>, getState: StateReader<S>, dispatch: Dispatcher<S>) => action(setState, getState, dispatch)
}

/**
 * Create a new store, and returns the context and the component to create. Once created, the component will propagate in React's context
 * the state of the store along with update methods matching the provided actions.
 * 
 * @param initialState The initial state, used to initialize the store.
 * @param initialization Method called after the context initialization.
 */
export function createStore<S>(
  initialState: S,
  initialization: (state: S, dispatch: Dispatcher<S>) => void = () => ({})
) {

  type ContextState = { state: S, dispatch: Dispatcher<S> }

  const initialContext: ContextState = {
    state: initialState,
    dispatch : () => Promise.reject()
  }

  // Create the context
  const context = React.createContext<ContextState>(initialContext)

  // Anonymous class of the component
  const provider = class extends React.Component<{}, S> {
    
    state = initialState

    dispatch = (action: Action<S>): Promise<S> => {
      const ret =
        action(
          (update) => {
            return new Promise<S>((resolve) => {
              this.setState(
                state => Object.assign({}, state, update instanceof Function ? update(state) : update),
                () => resolve(this.state)
              )
            })
          },
          () => this.state,
          this.dispatch
        )

      if(ret instanceof Promise)
        return ret.then(() => (() => this.state)())
      else
        return Promise.resolve(this.state)
    }

    componentDidMount() {
      initialization(this.state, this.dispatch)
    }

    render() {
      return (
        <context.Provider value={{ state: this.state, dispatch: this.dispatch }} >
          {this.props.children}
        </context.Provider>
      )
    }

  }

  // High order component to map some of te props to the context's store
  const withStore = <PROPS extends object, MAPPED_PROPS extends object>(
    Component: ComponentType<PROPS>,
    connect: (state: Readonly<S>, dispatch: Dispatcher<S>) => MAPPED_PROPS
  ): ComponentType<Difference<PROPS, MAPPED_PROPS>> => {

    return class extends React.Component<Difference<PROPS, MAPPED_PROPS>, S> {
      
      render() {
        return (
          <context.Consumer>
            {(ctx) => <Component { ...connect(ctx.state, ctx.dispatch)} {...this.props} />}
          </context.Consumer>
        )
      }

    } 

  }

  return {
    Store: provider,
    withStore
  }

}
