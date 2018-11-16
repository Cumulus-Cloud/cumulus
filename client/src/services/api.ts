import axios from 'axios'

import { ApiError } from 'models/ApiError'
import { EnrichedFile } from 'models/EnrichedFile'
import { Directory, File, FsNode, DirectoryWithContent, SearchResult, isDirectory, isFile } from 'models/FsNode'
import { User } from 'models/User'
import { AppSession } from 'models/AppSession'
import { ApiList } from 'models/utils'

import Routes from 'services/routes'

import { Search } from 'store/states/fsState'



export const ApiUtils = {

  maxResultDefault: 50,

  pagination(limit: number = 50, offset: number = 0): Map<string, string> {
    return new Map([['offset', `${offset}`], ['limit', `${limit}`]])
  },

  serializeQueryParams(queryParams: Map<string, string>): string {
    const queryString =
      Array.from(queryParams.entries())
        .filter((value) => value[1] !== '')
        .map((value) => `${encodeURIComponent(value[0])}=${encodeURIComponent(value[1])}&`)
        .join('')

    return queryString === '' ? '' : `?${queryString.substring(0, queryString.length - 1)}`
  },

  post<B, R>(path: string, body: B, queryParams: Map<string, string> = new Map(), onProgress: (p: number) => void = () => {}): Promise<ApiError | R> {
    return this.withPayload<B, R>('POST', path, body, queryParams, onProgress)
  },

  put<B, R>(path: string, body: B, queryParams: Map<string, string> = new Map(), onProgress: (p: number) => void = () => {}): Promise<ApiError | R> {
    return this.withPayload<B, R>('PUT', path, body, queryParams, onProgress)
  },

  get<R>(path: string, queryParams: Map<string, string> = new Map()): Promise<ApiError | R> {
    return this.withoutPayload('GET', path, queryParams)
  },

  delete<R>(path: string, queryParams: Map<string, string> = new Map()): Promise<ApiError | R> {
    return this.withoutPayload('DELETE', path, queryParams)
  },

  withPayload<B, R>(method: string, path: string, body: B, queryParams: Map<string, string>, onProgress: (p: number) => void): Promise<ApiError | R> {
    return axios
      .request({
        method: method,
        url: path + this.serializeQueryParams(queryParams),
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded * 100) / progressEvent.total
          onProgress(progress)
        },
        data: body,
        validateStatus: () => true
      })
      .then((response) => response.data)
      .catch((e) => {
        console.error(e)
        // TODO handle error
      })
  },

  withoutPayload<R>(method: string, path: string, queryParams: Map<string, string> = new Map()): Promise<ApiError | R> {
    return axios
      .request({
        method: method,
        url: path + this.serializeQueryParams(queryParams),
        validateStatus: () => true
      })
      .then((response) => response.data)
      .catch((e) => {
        console.error(e)
        // TODO handle error
      })
  }

}

const Api = {

  management: {
    reload(): Promise<ApiError | {}> {
      return ApiUtils.get(Routes.api.management.reload)
    },
    stop(): Promise<ApiError | {}> {
      return ApiUtils.get(Routes.api.management.stop)
    }
  },

  user: {
    me(): Promise<ApiError | User> {
      return ApiUtils.get(Routes.api.users.me)
    },

    signIn(login: string, password: string): Promise<ApiError | { token: string, user: User }> {
      return ApiUtils.post(Routes.api.users.login, { login, password })
    },

    signUp(login: string, email: string, password: string): Promise<ApiError | User> {
      return ApiUtils.post(Routes.api.users.signUp, { login, email, password })
    },

    signOut(): Promise<ApiError | void> {
      return ApiUtils.post(Routes.api.users.signOut, {})
    },

    setFirstPassword(password: string): Promise<ApiError | User> {
      return ApiUtils.post(Routes.api.users.setFirstPassword, { password })
    },

    changeLang(lang: string): Promise<ApiError | User> {
      return ApiUtils.post(Routes.api.users.changeLang, { lang })
    },

    changePassword(previousPassword: string, newPassword: string): Promise<ApiError | User> {
      return ApiUtils.post(Routes.api.users.changePassword, { previousPassword, newPassword })
    },

    sessions: {
      all(offset: number): Promise<ApiError | ApiList<AppSession>> {
        return ApiUtils.get(Routes.api.users.sessions.all, ApiUtils.pagination(offset = offset))
      },

      get(ref: string): Promise<ApiError | AppSession> {
        return ApiUtils.get(Routes.api.users.sessions.get(ref))
      },

      revoke(ref: string): Promise<ApiError | AppSession> {
        return ApiUtils.post(Routes.api.users.sessions.revoke(ref), {})
      }
    }

  },

  fs: {
    get(path: string): Promise<ApiError | FsNode> {
      return ApiUtils.get<FsNode>(Routes.api.fs.base, new Map([[ 'path', path ]]))
    },

    getDirectory(path: string): Promise<ApiError | Directory> {
      return this.get(path).then((result) => {
        if('errors' in result)
          return result
        if(isDirectory(result))
          return result
        else
          return {
            key: 'todo', // Proper error message
            message: 'todo',
            errors: {},
            args: []
          }
      })
    },

    getFile(path: string): Promise<ApiError | File> {
      return this.get(path).then((result) => {
        if('errors' in result)
          return result
        if(isFile(result))
          return result
        else
          return {
            key: 'todo', // Proper error message
            message: 'todo',
            errors: {},
            args: []
          }
      })
    },

    getContent(id: string, contentOffset?: number, contentLimit?: number): Promise<ApiError | DirectoryWithContent> {
      return ApiUtils.get<DirectoryWithContent>(
        Routes.api.fs.getContent(id),
        ApiUtils.pagination(contentLimit || ApiUtils.maxResultDefault, contentOffset || 0)
      )
    },

    // TODO test
    search(path: string, search: Search, contentOffset?: number, contentLimit?: number): Promise<ApiError | SearchResult> {
      const pagination = ApiUtils.pagination(contentLimit || ApiUtils.maxResultDefault, contentOffset || 0)
      const searchParam = new Map([
        [ 'path', path ],
        [ 'name', search.query ],
        [ 'recursiveSearch', search.recursiveSearch ? 'true' : 'false' ]
      ])
      const nodeType = search.nodeType === 'ALL' ? new Map() : new Map([[ 'nodeType', search.nodeType ]])

      const params = new Map([...searchParam, ...nodeType, ...pagination])

      return ApiUtils.get<SearchResult>(
        Routes.api.fs.search,
        params
      )
    },

    createDirectory(path: string): Promise<ApiError | Directory> {
      return ApiUtils.put(Routes.api.fs.create, { path: path })
    },

    uploadFile(parentId: string, file: EnrichedFile, onProgress: (percentage: number) => void): Promise<ApiError | any> {
      // TODO error handling
      function fileReader(file: EnrichedFile) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as any) // TODO fix
          }

          reader.readAsArrayBuffer(file.file)
        })
      }

      return fileReader(file).then((result) => {
        return ApiUtils.post(
          Routes.api.fs.upload(parentId),
          result,
          new Map([
            [ 'filename', file.filename ],
            [ 'cipher', file.crypted ? 'AES' : '' ],
            [ 'compression', file.compressed ? 'DEFLATE' : '' ]
          ]),
          onProgress
        )
      })
    },

    moveNodes(ids: string[], destination: string): Promise<ApiError | ApiList<FsNode>> {
      return ApiUtils.post(
        Routes.api.fs.base,
        {
          nodes: ids,
          destination,
          _type: 'io.cumulus.controllers.payloads.FsNodesDisplacementPayload'
        }
      )
    },

    deleteNodes(ids: string[], deleteContent: boolean): Promise<ApiError | ApiList<FsNode>> {
      return ApiUtils.post(
        Routes.api.fs.base,
        {
          nodes: ids,
          deleteContent,
          _type: 'io.cumulus.controllers.payloads.FsNodesDeletionPayload'
        }
      )
    }

  }

}

export default Api
