import * as React from 'react'


// Helper to extract the infered type of the first argument of a function
type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : any

// Type for an action impacting the state
export type Action<T, S, ACTIONS extends Actions<S, ACTIONS>> = (param: T, setState: (update: ((s: S) => Partial<S>) | Partial<S> ) => void, getContext: () => ContextState<S, ACTIONS>) => void | Promise<void>
export type PureAction<S, ACTIONS extends Actions<S, ACTIONS>> = Action<undefined, S, ACTIONS>

// Type for all the actions of a given store
type Actions<S, ACTIONS extends Actions<S, ACTIONS>> = {
  [key: string]: Action<any, S, ACTIONS> // Any because we can't guess the right type (but this has no impact on the typing)
}

// Type for update action, derived from the user-defined action 
type UpdateActionWithParameter<T, S> = (param: T) => Promise<S>
type UpdateAction<S> = () => Promise<S>

// Type for all the update action, derived from the user-defined action 
type UpdateActions<S, ACTIONS extends Actions<S, ACTIONS>> = {
  [key in keyof ACTIONS]: FirstArgument<ACTIONS[key]> extends undefined ? UpdateAction<S> : UpdateActionWithParameter<FirstArgument<ACTIONS[key]>, S> // Magic, allow to have the right key and type
}

// Type definition of the context
export type Context<S, ACTIONS extends Actions<S, ACTIONS>> = { state: S, actions: UpdateActions<S, ACTIONS> }

// Type for the state of the context. The real context is different to allow to easily create mapped actions to update the state
export type ContextState<S, ACTIONS extends Actions<S, ACTIONS>> = {
  state : S,
  actions: UpdateActions<S, ACTIONS>
}

/**
 * Create a new store, and returns the context and the component to create. Once created, the component will propagate in React's context
 * the state of the store along with update methods matching the provided actions.
 * 
 * @param initialState The initial state, used to initialize the store.
 * @param actions The actions to be used on the state. This actions can either be synchronous or asynchronous.
 */
export function createStore<STATE extends Object, ACTIONS extends Actions<STATE, ACTIONS>>(
  initialState: STATE,
  actions: ACTIONS,
  initialization: (context: Context<STATE, ACTIONS>) => void = () => ({})
) {

  // The initial context
  const initialContext = {
    state: initialState,
    actions: Object.assign({}, ...Object.keys(actions).map(k => ({ [k]: () => ({})}))) // Placeholder, Actions will be modified to be able to update the state
  }

  // Create the context
  const context = React.createContext<Context<STATE, ACTIONS>>(initialContext)

  // Anonymous class of the component
  const provider = class extends React.Component<{}, Context<STATE, ACTIONS>> {

    state = {
      state: initialState,
      actions: Object.assign({}, ...Object.keys(actions).map((k) => {
        return { [k]: this.doAction(actions[k]) }
      }))
    }

    doAction<T>(action: Action<T, STATE, ACTIONS>): (value: T) => Promise<STATE> {
      return (value: T) => {
        const ret =
          action(
            value,
            (update: ((s: STATE) => Partial<STATE>) | Partial<STATE>) => (
              this.setState(state => ({state: Object.assign({}, state.state, update instanceof Function ? update(state.state) : update) }))
            ),
            () => this.state
          )
        
        if(ret instanceof Promise)
          return ret.then(() => (() => this.state.state)())
        else
          return Promise.resolve(this.state.state)
      }
    }

    componentDidMount() {
      initialization(this.state)
    }

    render() {
      return (
        <context.Provider value={this.state} >
          {this.props.children}
        </context.Provider>
      )
    }

  }

  const withStore = (method: ((ctx: Context<STATE, ACTIONS>) => JSX.Element)) => {
    return (
      <context.Consumer>
        {method}
      </context.Consumer>
    )
  }
 
  return {
    Store: provider,
    withStore
  }

}
