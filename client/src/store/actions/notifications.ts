import uuid = require('uuid/v4')

import { ContextState } from 'utils/store'
import { State } from 'store/store'


export const showNotification = ({ setState }: ContextState<State>) => (message: string) => {
  const newMessage = { id: uuid(), message }

  setState(state => ({
    notifications: {
      messages: state.notifications.messages.concat(newMessage)
    }
  }))
}

export const hideNotification = ({ setState }: ContextState<State>) => (id: string) => {
  setState(state => ({
    notifications: {
      messages: state.notifications.messages.slice().filter(m => m.id !== id)
    }
  }))
}
