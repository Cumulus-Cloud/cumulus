
type NotificationsState = {
  messages: {
    id: string,
    message: string
  }[]
}

export const initialState: () => NotificationsState =
  () => ({
    messages: []
  })

export default NotificationsState
