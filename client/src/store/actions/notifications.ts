import uuid = require('uuid/v4')

import { createAction } from 'store/actions'


export const showNotification = createAction<string>((message, setState) => {
  const newMessage = { id: uuid(), message }

  setState(state => ({
    notifications: {
      messages: state.notifications.messages.concat(newMessage)
    }
  }))
})

export const hideNotification = createAction<string>((id, setState) => {
  setState(state => ({
    notifications: {
      messages: state.notifications.messages.slice().filter(m => m.id !== id)
    }
  }))
})
