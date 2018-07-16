import { Action } from 'redux'
import { ActionCreator } from 'react-redux'
import uuid = require('uuid/v4')

export interface ShowSnakebarAction extends Action {
  type: 'SNACKBAR/SHOW'
  payload: {
    id: String
    message: String
  }
}

export const showSnakebar: ActionCreator<ShowSnakebarAction> =
  (message: string) => ({
    type: 'SNACKBAR/SHOW',
    payload: {
      id: uuid(),
      message
    }
  })

  export interface HideSnakebarAction extends Action {
    type: 'SNACKBAR/HIDE'
    payload: {
      id: String
    }
  }
  
  export const hideSnakebar: ActionCreator<HideSnakebarAction> =
    (id: string) => ({
      type: 'SNACKBAR/HIDE',
      payload: {
        id
      }
    })
  
export type SnackbarActions =
    ShowSnakebarAction |
    HideSnakebarAction
