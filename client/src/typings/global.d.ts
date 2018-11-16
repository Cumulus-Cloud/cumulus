import { User } from 'models/User'
import { DirectoryWithContent } from 'models/FsNode'

declare global {

  // Injected by the webpack build
  const env: {
    isProd: boolean
    isDev: boolean
    isLiveReload: boolean
  }

  type Trace = {
    object: string
    func: string
    line: number
  }

  type ServerError = {
    type: string,
    message: string,
    stack: Trace[]
  }

  // Injected by the backend's templating
  const user: User | null
  const directoryWithContent: DirectoryWithContent | null
  const error: { causes: ServerError[] } | null

}
