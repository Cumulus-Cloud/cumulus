
import { createAction, createPureAction } from 'store/actions'

export const forceMenu = createAction<boolean>((show, setState) => {
  setState({
    menu: {
      show
    }
  })
})

export const toggleMenu = createPureAction((setState) => {
  setState(state => ({
    menu: {
      show: !state.menu.show
    }
  }))
})
