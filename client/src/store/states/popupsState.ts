
export type FsPopupType =
  'DIRECTORY_CREATION' |
  'FILE_UPLOAD' |
  'NODE_DETAIL' |
  'NODE_MOVE'   |
  'NODE_DELETION'

export type PopupsState<PopupType, Target> = {
  open?: PopupType,
  target: Target
}

export const initialState = <PopupType, Target>(target: Target): PopupsState<PopupType, Target> =>
  ({
    open: undefined,
    target: target
  })

export default PopupsState
