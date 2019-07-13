import axios, { Method } from 'axios'

import { EnrichedFile } from 'models/EnrichedFile'
import { Directory, File, FsNode, DirectoryWithContent, SearchResult, isDirectory, isFile, FsNodeType } from 'models/FsNode'
import { User } from 'models/User'
import { Event } from 'models/Event'
import { AppSession } from 'models/AppSession'
import { ApiList } from 'models/utils'

import Routes from 'services/routes'

import { Search } from 'store/states/fsState'


export const ApiUtils = {

  maxResultDefault: 50,

  pagination(offset: number = 0, limit: number = 50): Map<string, string> {
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

  post<B, R>(path: string, body: B, queryParams: Map<string, string> = new Map(), onProgress: (p: number) => void = () => {}): Promise<R> {
    return this.withPayload<B, R>('POST', path, body, queryParams, onProgress)
  },

  put<B, R>(path: string, body: B, queryParams: Map<string, string> = new Map(), onProgress: (p: number) => void = () => {}): Promise<R> {
    return this.withPayload<B, R>('PUT', path, body, queryParams, onProgress)
  },

  get<R>(path: string, queryParams: Map<string, string> = new Map()): Promise<R> {
    return this.withoutPayload('GET', path, queryParams)
  },

  delete<R>(path: string, queryParams: Map<string, string> = new Map()): Promise<R> {
    return this.withoutPayload('DELETE', path, queryParams)
  },

  withPayload<B, R>(method: Method, path: string, body: B, queryParams: Map<string, string>, onProgress: (p: number) => void): Promise<R> {
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
      .then((response) => {
        if(response.status >= 400)
          throw response.data // Our server sent back an error
        else
          return response.data
      })
      .catch((e) => {
        if('key' in e)
          throw e // Our server sent back an error
        else {
          console.error(e)
          throw {
            key: 'network.error',
            message: 'La requête a échoué',
            errors: {},
            args: []
          } // The request failed, throw an error
        }
      })
  },

  withoutPayload<R>(method: Method, path: string, queryParams: Map<string, string> = new Map()): Promise<R> {
    return axios
      .request({
        method: method,
        url: path + this.serializeQueryParams(queryParams),
        validateStatus: () => true
      })
      .then((response) => {
        if(response.status >= 400)
          throw response.data // Our server sent back an error
        else
          return response.data
      })
      .catch((e) => {
        if('key' in e)
          throw e // Our server sent back an error
        else {
          console.error(e)
          throw {
            key: 'network.error',
            message: 'La requête a échoué',
            errors: {},
            args: []
          } // The request failed, throw an error
        }
      })
  }

}

const Api = {

  management: {
    reload(): Promise<void> {
      return ApiUtils.get(Routes.api.management.reload)
    },
    stop(): Promise<void> {
      return ApiUtils.get(Routes.api.management.stop)
    }
  },

  user: {
    me(): Promise<User> {
      return ApiUtils.get(Routes.api.users.me)
    },

    signIn(login: string, password: string): Promise<{ token: string, user: User }> {
      return ApiUtils.post(Routes.api.users.login, { login, password })
    },

    signUp(login: string, email: string, password: string): Promise<User> {
      return ApiUtils.post(Routes.api.users.signUp, { login, email, password })
    },

    setFirstPassword(password: string): Promise<User> {
      return ApiUtils.post(Routes.api.users.setFirstPassword, { password })
    },

    changeLang(lang: string): Promise<User> {
      return ApiUtils.post(Routes.api.users.changeLang, { lang })
    },

    changePassword(previousPassword: string, newPassword: string): Promise<User> {
      return ApiUtils.post(Routes.api.users.changePassword, { previousPassword, newPassword })
    },

    events: {
      all(offset: number): Promise<ApiList<Event>> {
        return ApiUtils.get(Routes.api.users.events, ApiUtils.pagination(offset = offset))
      }
    },

    sessions: {
      all(offset: number): Promise<ApiList<AppSession>> {
        return ApiUtils.get(Routes.api.users.sessions.all, ApiUtils.pagination(offset = offset))
      },

      get(ref: string): Promise<AppSession> {
        return ApiUtils.get(Routes.api.users.sessions.get(ref))
      },

      revoke(ref: string): Promise<AppSession> {
        return ApiUtils.post(Routes.api.users.sessions.revoke(ref), {})
      }
    }

  },

  fs: {
    get(path: string): Promise<FsNode> {
      return ApiUtils.get<FsNode>(Routes.api.fs.base, new Map([[ 'path', path ]]))
    },

    getDirectory(path: string): Promise<Directory> {
      return this.get(path).then((result) => {
        if(isDirectory(result))
          return result
        else
          throw {
            key: 'todo', // Proper error message
            message: 'todo',
            errors: {},
            args: []
          }
      })
    },

    getFile(path: string): Promise<File> {
      return this.get(path).then((result) => {
        if(isFile(result))
          return result
        else
          throw {
            key: 'todo', // Proper error message
            message: 'todo',
            errors: {},
            args: []
          }
      })
    },

    getContent(id: string, nodeType?: FsNodeType, contentOffset?: number, contentLimit?: number): Promise<DirectoryWithContent> {
      const pagination = ApiUtils.pagination(contentOffset || 0, contentLimit || ApiUtils.maxResultDefault)
      const nodeTypeParam = nodeType ? new Map([[ 'nodeType', nodeType ]]) : new Map()

      const params = new Map([...nodeTypeParam, ...pagination])

      return ApiUtils.get<DirectoryWithContent>(
        Routes.api.fs.getContent(id),
        params
      )
    },

    search(path: string, search: Search, contentOffset?: number, contentLimit?: number): Promise<SearchResult> {
      const pagination = ApiUtils.pagination(contentOffset || 0, contentLimit || ApiUtils.maxResultDefault)
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

    createDirectory(path: string): Promise<Directory> {
      return ApiUtils.put(Routes.api.fs.create, { path: path })
    },

    uploadFile(parentId: string, file: EnrichedFile, onProgress: (percentage: number) => void): Promise<any> {
      return ApiUtils.post(
        Routes.api.fs.upload(parentId),
        file.file,
        new Map([
          [ 'filename', file.filename ],
          [ 'cipher', file.crypted ? 'AES' : '' ],
          [ 'compression', file.compressed ? 'DEFLATE' : '' ]
        ]),
        onProgress
      )
    },

    moveNodes(ids: string[], destination: string): Promise<ApiList<FsNode>> {
      return ApiUtils.post(
        Routes.api.fs.base,
        {
          nodes: ids,
          destination,
          _type: 'io.cumulus.controllers.payloads.FsNodesDisplacementPayload' // Ugly
        }
      )
    },

    deleteNodes(ids: string[], deleteContent: boolean): Promise<ApiList<FsNode>> {
      return ApiUtils.post(
        Routes.api.fs.base,
        {
          nodes: ids,
          deleteContent,
          _type: 'io.cumulus.controllers.payloads.FsNodesDeletionPayload' // Ugly
        }
      )
    }

  }

}

export default Api
