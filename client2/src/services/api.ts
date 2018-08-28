import axios from 'axios'

import { ApiError } from './../models/ApiError'
import { EnrichedFile } from './../models/EnrichedFile'
import { Directory, File, FsNode, FsOperation, DirectoryWithContent } from './../models/FsNode'
import { User } from '../models/User'
import { AppSession } from '../models/AppSession'
import { ApiList } from '../models/utils'

const urlBase = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:9000'

export const ApiUtils = {

  urlBase: urlBase,

  maxResultDefault: 20, // TODO what value to use ?

  pagination(limit: number = 20, offset: number = 0): Map<string, string> {
    return new Map([['offset', `${offset}`], ['limit', `${limit}`]])
  },

  serializeQueryParams(queryParams: Map<string, string>): string {
    const queryString =
      Array.from(queryParams.entries())
      .map((value) => {
        if(value[1] !== '')
          return `${encodeURIComponent(value[0])}=${encodeURIComponent(value[1])}&` 
        else
          return ''
      })
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
        url: `${urlBase}/api${path}${this.serializeQueryParams(queryParams)}`,
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
        url: `${urlBase}/api${path}${this.serializeQueryParams(queryParams)}`,
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

  user: {
    me(): Promise<ApiError | User> {
      return ApiUtils.get('/users/me')
    },

    signIn(login: string, password: string): Promise<ApiError | { token: string, user: User }> {
      return ApiUtils.post('/users/login', { login, password })
    },
  
    signUp(login: string, email: string, password: string): Promise<ApiError | User> {
      return ApiUtils.post('/users/signup', { login, email, password })
    },

    signOut(): Promise<ApiError | void> {
      return ApiUtils.post('/users/logout', {})
    },

    setFirstPassword(password: string): Promise<ApiError | User> {
      return ApiUtils.post('/users/firstPassword', { password })
    },

    changeLang(lang: string): Promise<ApiError | User> {
      return ApiUtils.post('/users/lang', { lang })
    },
    
    changePassword(previousPassword: string, newPassword: string): Promise<ApiError | User> {
      return ApiUtils.post('/users/password', { previousPassword, newPassword })
    },

    sessions: {
      all(offset: number): Promise<ApiError | ApiList<AppSession>> {
        return ApiUtils.get('/users/sessions', ApiUtils.pagination(offset = offset))
      },

      get(ref: string): Promise<ApiError | AppSession> {
        return ApiUtils.get(`/users/sessions/${ref}`) 
      },

      revoke(ref: string): Promise<ApiError | AppSession> {
        return ApiUtils.post(`/users/sessions/${ref}/revoke`, {})
      }
    }

  },

  fs: {
    get(path: string): Promise<ApiError | FsNode> {
      return ApiUtils.get<FsNode>(`/fs`, new Map([[ 'path', path ]]))
    },

    getDirectory(path: string): Promise<ApiError | Directory> {
      return this.get(path).then((result) => {
        if('errors' in result)
          return result
        if(result.nodeType == 'DIRECTORY')
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
        if(result.nodeType == 'FILE')
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
        `/fs/${id}/content`,
        ApiUtils.pagination(contentLimit || ApiUtils.maxResultDefault, contentOffset || 0)
      )
    },

    createDirectory(path: string): Promise<ApiError | Directory> {
      return ApiUtils.put(`/fs`, { path: path })
    },

    uploadFile(parentId: string, file: EnrichedFile, onProgress: (percentage: number) => void): Promise<ApiError | any> {

      // TODO error handling
      function fileReader(file: EnrichedFile) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result) // TODO fix
          }
    
          reader.readAsArrayBuffer(file.file)
        })
      }

      return fileReader(file).then((result) => {
        // TODO add compression and cipher
        return ApiUtils.post(
          `/fs/${parentId}/upload`,
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

    updateFile(path: string, operation: FsOperation): Promise<ApiError | FsNode> {
      return ApiUtils.post(`/fs${path}`, operation)
    },

    deleteFile(path: string): Promise<ApiError | void> {
      return ApiUtils.delete(`/fs${path}`)
    }

  }

}

export default Api
