
export type PopupType =
  'DIRECTORY_CREATION' |
  'FILE_UPLOAD' |
  'NODE_DETAIL' |
  'NODE_DELETION'

export type PopupsState = {
  open?: PopupType
}

export const initialState: () => PopupsState =
  () => ({
    open: undefined
  })

export default PopupsState
