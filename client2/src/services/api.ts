import { EnrichedFile } from './../models/EnrichedFile'
import axios from 'axios'

import { ApiError } from './../models/ApiError'
import { Directory, File, FsNode, FsOperation } from './../models/FsNode'
import { User } from '../models/User'
import { AppSession } from '../models/AppSession'

const urlBase = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:9000'

interface ApiList<T> {
  items: T[]
  size: number
}

interface ApiPaginatedList<T> {
  items: T[]
  size: number
  offset: number
}

export const ApiUtils = {

  urlBase: urlBase,

  maxResultDefault: 30,

  pagination(limit: number = 30, offset: number = 0): Map<string, string> {
    return new Map([['offset', `${offset}`], ['limit', `${limit}`]])
  },

  serializeQueryParams(queryParams: Map<string, string>): string {
    const queryString =
      Array.from(queryParams.entries())
      .map((value) => {
        return `${encodeURIComponent(value[0])}=${encodeURIComponent(value[1])}` 
      })
      .join('&')

    return queryString === '' ? '' : `?${queryString}`
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

    signIn(login: string, password: string): Promise<ApiError | User> {
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
      all(offset: number): Promise<ApiError | ApiPaginatedList<AppSession>> {
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
      return ApiUtils.get<FsNode>(`/fs${path}`)
    },

    getDirectory(path: string, contentLimit?: number, contentOffset?: number): Promise<ApiError | Directory> {
      return ApiUtils.get<FsNode>(
        `/fs${path}`,
        new Map([['contentOffset', `${contentOffset || 0}`], ['contentLimit', `${contentLimit || ApiUtils.maxResultDefault}`]])
      ).then((result) => {
        
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
      return ApiUtils.get<FsNode>(`/fs${path}`).then((result) => {
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

    createDirectory(path: string): Promise<ApiError | Directory> {
      return ApiUtils.put(`/fs${path}`, {})
    },

    uploadFile(file: EnrichedFile, onProgress: (percentage: number) => void): Promise<ApiError | any> {

      function fileReader(file: EnrichedFile){
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(reader.result)
          };
    
          reader.readAsArrayBuffer(file.file)
        })
      }

      return fileReader(file).then((result) => {
        // TODO need path
        // TODO add compression and cipher
        return ApiUtils.post(`/upload/${file.filename}`, result, new Map(), onProgress)
      })
    },

    updateFile(path: string, operation: FsOperation): Promise<ApiError | FsNode> {
      return ApiUtils.post(`/fs${path}`, operation)
    },

    deleteFile(path: string): Promise<ApiError | void> {
      return ApiUtils.delete(`/fs${path}`)
    },

  }

}

export default Api
