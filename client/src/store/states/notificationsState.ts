
type NotificationMessage = {
  id: string,
  message: string
}

type NotificationsState = {
  messages: NotificationMessage[]
}

export const initialState: () => NotificationsState =
  () => ({
    messages: []
  })

export default NotificationsState
