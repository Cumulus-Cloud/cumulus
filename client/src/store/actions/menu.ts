import { ContextState } from 'utils/store'

import { State } from 'store/store'


export const forceMenu = ({ setState }: ContextState<State>) => (show: boolean) => {
  setState({
    menu: {
      show
    }
  })
}

export const toggleMenu = ({ setState }: ContextState<State>) => () => {
  setState(state => ({
    menu: {
      show: !state.menu.show
    }
  }))
}
