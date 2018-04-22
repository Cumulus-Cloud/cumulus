import Axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios"
import { Observer } from "rxjs/Observer"
import { Observable } from "rxjs/Observable"
import { Validator } from "validation.ts"
import { User, UserValidator } from "models/User"
import { AuthApiResponse, AuthApiResponseValidator } from "models/AuthApiResponse"
import { FsNode, FsDirectory, FsNodeValidator, NodeType } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { Share, ShareValidator } from "models/Share"
import { SearchResult, SearchResultValidator } from "models/Search"
import querystring from "utils/querystring"
import { history } from "store"

export interface Requests {
  signup(login: string, email: string, password: string): Observable<AuthApiResponse>
  login(login: string, password: string): Observable<AuthApiResponse>
  logout(): Observable<void>
  user(): Observable<User>
  fetchDirectory(path: string): Observable<FsDirectory>
  deleteFsNode(fsNode: FsNode): Observable<void>
  share(fsNode: FsNode): Observable<Share>
  move(source: string, to: string): Observable<FsNode>
  createFnNode(fsNode: FsNode, name: string, nodeType: NodeType): Observable<FsNode>
  search(query: string, current?: FsDirectory, nodeType?: NodeType, type?: string): Observable<SearchResult>
  upload(path: string, fileToUpload: FileToUpload, progression?: (e: ProgressEvent) => void): Observable<FsNode>
}

type Request = <T>(config: AxiosRequestConfig, validator?: Validator<T>) => Observable<T>

export function createRequests(request: Request): Requests {
  return {
    login: (login, password) => request({
      url: "/api/users/login",
      method: "POST",
      data: { login, password }
    }, AuthApiResponseValidator),
    signup: (login, email, password) => request({
      url: "/api/users/signup",
      method: "POST",
      data: { login, email, password }
    }, AuthApiResponseValidator),
    logout: () => request({
      url: `/api/users/logout`,
      method: "POST",
    }),
    user: () => request({
      url: `/api/users/me`,
      method: "GET",
    }, UserValidator),
    fetchDirectory: path => request({
      url: `/api/fs${encodeURI(path)}`,
      method: "GET",
    }),
    deleteFsNode: fsNode => request({
      url: `/api/fs${encodeURI(fsNode.path)}`,
      method: "DELETE",
    }),
    share: fsNode => request({
      url: `/api/fs${encodeURI(fsNode.path)}`,
      method: "POST",
      data: { operation: "SHARE_LINK" }
    }, ShareValidator),
    move: (source, to) => request({
      url: `/api/fs${encodeURI(source)}`,
      method: "POST",
      data: { operation: "MOVE", to }
    }, FsNodeValidator),
    createFnNode: (fsNode, name, nodeType) => request({
      url: `/api/fs${encodeURI(`${fsNode.path}${fsNode.path === "/" ? "" : "/"}${name}`)}`,
      method: "PUT",
      data: { nodeType }
    }, FsNodeValidator),
    search: (query, current, nodeType, type) => {
      const qs = querystring({
        name: query,
        nodeType,
        type
      })
      return request({
        url: `/api/search${current ? current.path : "/"}${qs}`,
        method: "GET",
      }, SearchResultValidator)
    },
    upload: (path, fileToUpload, progression) => {
      const qs = querystring({
        cipher: fileToUpload.cipher,
        compression: fileToUpload.compression,
      })
      return request({
        url: `/api/upload${encodeURI(path)}${qs}`,
        method: "POST",
        onUploadProgress: progression,
        data: fileToUpload.file as Blob
      })
    }
  }
}

export function createApiInstance(baseURL?: string): Requests {
  const instance = Axios.create({
    baseURL,
    timeout: 5 * 60 * 1000,
    headers: {
      "Content-Type": "application/json"
    }
  })
  return createRequests(createRequest(instance))
}

// TODO refactor
export function createRequest(instance: AxiosInstance): Request {
  return <T>(config: AxiosRequestConfig, validator?: Validator<T>) => {
    return Observable.create((observer: Observer<T>) => {
      const source = Axios.CancelToken.source()
      const cancelToken = source.token
      instance.request<T>({ ...config, cancelToken })
        .then(response => {
          if (validator) {
            validator.validate(response.data).mapError(err => {
              console.error("Serveur Api validation fail", config.url, err)
            })
          }
          observer.next(response.data)
          observer.complete()
        })
        .catch((error: AxiosError) => {
          if (error.response && error.response.status === 400) {
            observer.error(error.response.data)
          } else if (error.response && error.response.status === 401) {
            history.replace("/login")
            observer.error(error.response.data)
          } else {
            observer.error(error)
          }
        })
      return () => source.cancel()
    })
  }
}
