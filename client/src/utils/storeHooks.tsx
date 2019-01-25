import React from 'react'


export type Store<S> = {
  setState: (updated: React.SetStateAction<S>) => Promise<S>
  state: S
}

export function createStore<S>(initialState: S): [React.Context<Store<S>>, React.ComponentClass<{}, S>] {
  const Context = React.createContext<Store<S>>({ state: initialState, setState: s => s })


  const Provider = class extends React.Component<{}, S> {

    state = initialState

    setStateWrapper = (value: React.SetStateAction<S>): Promise<S> => {
      return new Promise<S>((resolve) => {
        this.setState(value, () => resolve(this.state))
      })
    }

    render() {
      return (
        <Context.Provider value={{ state: this.state, setState: this.setStateWrapper }} >
          {this.props.children}
        </Context.Provider>
      )
    }

  }

  return [Context, Provider]
}
