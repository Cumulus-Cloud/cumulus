import { push } from 'connected-react-router'

export type PopupType = 'DIRECTORY_CREATION' | 'FILE_UPLOAD' | 'FILE_UPLOAD_PROGRESS' | 'NODE_DETAILS'

export const PopupTypes = {
  directoryCreation: 'DIRECTORY_CREATION',
  fileUpload: 'FILE_UPLOAD',
  nodeDetails:  'NODE_DETAILS'
}

function getParameters(params: string): { [key: string]: string } {
  const result: { [key: string]: string } = {}

  params.substr(1).split("&").map((part) => {
    const item = part.split("=")
    if(item[0] && item[0] !== '')
      result[item[0]] = decodeURIComponent(item[1])
  })

  return result
}

/**
 * Returns if a popup is selected (displayed) for the provided location.
 */
export const isSelected = (type: PopupType) => (location: { pathname: string, search: string }) => {
  const params = getParameters(location.search)
  const action = params['action']
  const param = params['param']

  return { selected: action === type, param }
}

/**
 * Returns an action to toggle a popup, using the provided location. Should be dispatched as a regular action.
 */
export const togglePopup = (type: PopupType, show: boolean, param?: string) => (location: { pathname: string }) => {
  if(show)
    return push(`${location.pathname}?action=${type}${param ? `&param=${param}` : ''}`)
  else
    return push(location.pathname)
}
