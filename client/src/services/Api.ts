import { history } from "store"
import { User, userValidator } from "models/User"
import { object, string, Validator } from "validation.ts"
import { FsNode, FsDirectory, FsNodeValidator, NodeType, FsFile } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { Share, ShareValidator } from "models/Share"
import { SearchResult, SearchResultValidator } from "models/Search"
import { Promise } from "es6-shim"
import { success } from "services/request"
import querystring from "utils/querystring"
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios"
import { Observable } from "rxjs/Observable"
import { Observer } from "rxjs/Observer"

export interface ApiError {
  key: string
  message: string
  errors: Record<string, ApiError[]>
  args: string[]
}

export interface Requests {
  signup(login: string, email: string, password: string): Observable<User>
  login(login: string, password: string): Observable<User>
}

type Request = <T>(config: AxiosRequestConfig, validator?: Validator<T>) => Observable<T>

export function createRequests(request: Request): Requests {
  return {
    login: (login: string, password: string) => {
      return request({
        url: "/api/users/login",
        method: "POST",
        data: { login, password }
      })
    },
    signup: (login: string, email: string, password: string) => {
      return request({
        url: "/api/users/signup",
        method: "POST",
        data: { login, email, password }
      })
    }
  }
}

export function createApiInstance(baseURL: string): Requests {
  const instance = axios.create({
    baseURL,
    timeout: 5 * 60 * 1000,
    headers: {
      "Content-Type": "application/json"
    }
  })
  return createRequests(createRequest(instance))
}

export function createRequest(instance: AxiosInstance): Request {
  return <T>(config: AxiosRequestConfig, validator?: Validator<T>) => {
    return Observable.create((observer: Observer<T>) => {
      const source = axios.CancelToken.source()
      const cancelToken = source.token
      instance.request<T>({ ...config, cancelToken })
        .then(response => {
          console.log("createRequest response", response)
          observer.next(response.data) // TODO add validation
          observer.complete()
        })
        .catch((error: AxiosError) => {
          console.log("createRequest error", error)
          if (error.response && error.response.status) {
            observer.error(error.response.data)
          } else {
            observer.error(error)
          }
        })
      return () => source.cancel()
    })
  }
}

const HEADERS = [
  ["Content-Type", "application/json"]
]

const AUTH_TOKEN_STORAGE_KEY = "AUTH_TOKEN_STORAGE_KEY"

function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.replace("/login")
      reject({
        message: "Unauthorized"
      })
    } else {
      resolve(token)
    }
  })
}

function withAuth(path: string, options?: RequestInit, headers?: Headers): Promise<Response> {
  return getAuthToken().then(token => {
    return fetch(path, {
      ...options,
      headers: [
        ...HEADERS,
        ["Authorization", token]
      ],
      credentials: "same-origin",
    })
  })
}

function saveAuthToken(token: string, session: boolean = false) {
  (session ? sessionStorage : localStorage).setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export const userApiResponse = object({
  user: userValidator,
  token: string
})
export function authenticate(login: string, password: string): Promise<User> {
  return fetch(`/api/users/login`, {
    method: "POST",
    body: JSON.stringify({ login, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success(userApiResponse)).then(response => {
    saveAuthToken(response.token)
    return response.user
  })
}

export function signup(login: string, email: string, password: string): Promise<User> {
  return fetch(`/api/users/signup`, {
    method: "POST",
    body: JSON.stringify({ login, email, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success(userApiResponse)).then(response => {
    saveAuthToken(response.token)
    return response.user
  })
}

export function me(): Promise<User> {
  return withAuth(`/api/users/me`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(userValidator))
}

export function createFnNode(fsNode: FsNode, name: string, nodeType: NodeType): Promise<FsNode> {
  const path = `${fsNode.path}${fsNode.path === "/" ? "" : "/"}${name}`
  return withAuth(`/api/fs${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({ nodeType })
  }).then(success(FsNodeValidator))
}

export function fetchDirectory(path: string): Promise<FsDirectory> {
  return withAuth(`/api/fs${encodeURI(path)}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(FsNodeValidator))
}

export function move(source: string, to: string): Promise<FsNode> {
  return withAuth(`/api/fs${encodeURI(source)}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ operation: "MOVE", to })
  }).then(success(FsNodeValidator))
}

export function deleteFsNode(fsNode: FsNode): Promise<void> {
  return withAuth(`/api/fs${encodeURI(fsNode.path)}`, {
    method: "DELETE",
    headers: HEADERS,
  }).then(success())
}

export function share(fsNode: FsNode): Promise<Share> {
  return withAuth(`/api/fs${encodeURI(fsNode.path)}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ operation: "SHARE_LINK" })
  }).then(success(ShareValidator))
}

export function search(query: string, current?: FsDirectory, nodeType?: NodeType, type?: string): Promise<SearchResult> {
  const qs = querystring({
    name: query,
    nodeType,
    type
  })
  return withAuth(`/api/search${current ? current.path : "/"}${qs}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(SearchResultValidator))
}

export function logout(): Promise<void> {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  return fetch("/api/users/logout", {
    method: "POST",
    credentials: "same-origin",
  }).then(() => {
    history.replace("/login")
  }).catch(() => {
    history.replace("/login")
  })
}

export function upload(path: string, fileToUpload: FileToUpload, progression?: (e: ProgressEvent) => void): Promise<FsNode> {
  return new Promise((resolve, reject) => {
    return getAuthToken().then(token => {
      const xhr = new XMLHttpRequest()
      const qs = querystring({
        cipher: fileToUpload.cipher,
        compression: fileToUpload.compression,
      })
      xhr.open("POST", `/api/upload${encodeURI(path)}${qs}`)
      xhr.setRequestHeader("Authorization", token)
      xhr.addEventListener("load", event => {
        // tslint:disable-next-line:no-any
        resolve(JSON.parse((event.target as any).response))
      })
      xhr.onerror = e => {
        console.log("onerror", e, xhr, xhr.status)
        reject({
          // tslint:disable-next-line:no-any
          message: (e.target as any).responseText,
          errors: {}
        })
      }
      if (progression) {
        xhr.upload.addEventListener("progress", progression)
      }
      xhr.send(fileToUpload.file as Blob)
    })
  })
}

export function getDownloadUrl(file: FsNode, cookie: boolean = true): string {
  if (cookie) {
    return `/api/download${encodeURI(file.path)}`
  } else {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.push("/login")
      return `/login`
    } else {
      return `/api/download${encodeURI(file.path)}?token=${token}`
    }
  }
}

export function getThumbnail(file: FsFile, cookie: boolean = true): string {
  if (cookie) {
    return `/api/thumbnail${encodeURI(file.path)}`
  } else {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.push("/login")
      return `/login`
    } else {
      return `/api/thumbnail${encodeURI(file.path)}?token=${token}`
    }
  }
}
