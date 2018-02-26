import { history } from "store"
import { User, userValidator } from "models/User"
import { object, string } from "validation.ts"
import { FsNode, FsDirectory, FsNodeValidator, NodeType, FsFile } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { Share, ShareValidator } from "models/Share"
import { SearchResult, SearchResultValidator } from "models/Search"
import { Promise } from "es6-shim"
import { success } from "services/request"
import querystring from "utils/querystring"

export interface ApiError {
  key: string
  message: string
  errors: Record<string, ApiError[]>
  args: string[]
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

export function createFnNode(path: string, nodeType: NodeType): Promise<FsNode> {
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

export function move(fsNode: FsNode, target: FsDirectory): Promise<FsNode> {
  return withAuth(`/api/fs${encodeURI(fsNode.path)}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ operation: "MOVE", to: `${target.path}/${fsNode.name}` })
  }).then(success(FsNodeValidator))
}

export function rename(fsNode: FsNode, to: string): Promise<FsNode> {
  return withAuth(`/api/fs${encodeURI(fsNode.path)}`, {
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
    getAuthToken().then(token => {
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
        reject({
          // tslint:disable-next-line:no-any
          message: (e.target as any).responseText
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
