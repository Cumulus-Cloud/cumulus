import  React from 'react'

// Helpers
export type StateUpdater<S> = (update: ((s: S) => Partial<S>) | Partial<S>) => Promise<S>
export type StateReader<S> = () => Readonly<S>

export type ContextState<S> = { state: S, getState: StateReader<S>, setState: StateUpdater<S> }

/**
 * Create a new store, and returns the context and the component to create. Once created, the component will propagate in React's context
 * the state of the store along with update methods matching the provided actions.
 *
 * @param initialState The initial state, used to initialize the store.
 * @param initialization Method called after the context initialization.
 */
export function createStore<S>(
  initialState: S,
  initialization: (state: S, setState: StateUpdater<S>) => void = () => ({})
): [React.Context<ContextState<S>>, React.ComponentClass<{}, S>] {

  const initialContext: ContextState<S> = {
    state: initialState,
    getState: () => initialState,
    setState : () => Promise.reject()
  }

  // Create the context
  const context = React.createContext<ContextState<S>>(initialContext)

  // Anonymous class of the component
  const provider = class extends React.Component<{}, S> {

    state = initialState

    getState() {
      return this.state
    }

    setStateWrapper: StateUpdater<S> = (update) => {
      return new Promise<S>((resolve) => {
        this.setState(
          state => Object.assign({}, state, update instanceof Function ? update(state) : update),
          () => resolve(this.state)
        )
      })
    }

    componentDidMount() {
      initialization(this.state, this.setStateWrapper)
    }

    render() {
      return (
        <context.Provider value={{ state: this.state, getState: this.getState.bind(this), setState: this.setStateWrapper }} >
          {this.props.children}
        </context.Provider>
      )
    }

  }

  return [
    context,
    provider
  ]

}
