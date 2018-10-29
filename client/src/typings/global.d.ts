import { User } from 'models/User'
import { DirectoryWithContent } from 'models/FsNode'

declare global {

  // Injected by the webpack build
  const env: {
    isProd: boolean
    isDev: boolean
    isLiveReload: boolean
  }

  // Injected by the backend's templating
  const user: User | undefined
  const directoryWithContent: DirectoryWithContent | undefined

}
