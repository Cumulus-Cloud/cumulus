import uuid = require('uuid/v4')

import { createAction } from 'store/actions'


export const showSnackebar = createAction<string>((message, setState) => {
  const newMessage = { id: uuid(), message }

  setState(state => ({
    snackbar: {
      messages: state.snackbar.messages.concat(newMessage)
    }
  }))
})

export const hideSnackbar = createAction<string>((id, setState) => {
  setState(state => ({
    snackbar: {
      messages: state.snackbar.messages.slice().filter(m => m.id !== id)
    }
  }))
})
