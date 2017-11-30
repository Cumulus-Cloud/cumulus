import { history } from "store"
import { User, userValidator } from "models/User"
import { object, string } from "validation.ts"
import { FsNode, FsNodeValidator, NodeType } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
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
export function login(login: string, password: string): Promise<User> {
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

export function fetchDirectory(path: string): Promise<FsNode> {
  return withAuth(`/api/fs${encodeURI(path)}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(FsNodeValidator))
}

export function deleteFsNode(fsNode: FsNode): Promise<void> {
  return withAuth(`/api/fs${encodeURI(fsNode.path)}`, {
    method: "DELETE",
    headers: HEADERS,
  }).then(success())
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
      let xhr = new XMLHttpRequest()
      const qs = querystring({
        cipher: fileToUpload.cipher,
        compression: fileToUpload.compression,
      })
      xhr.open("POST", `/api/upload${encodeURI(path)}${qs}`)
      xhr.setRequestHeader("Authorization", token)
      xhr.addEventListener("load", event => {
        resolve(JSON.parse((event.target as any).response))
      })
      xhr.onerror = e => {
        reject({
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

export function getDownloadUrl(file: FsNode, cookie: boolean): string {
  if (cookie) {
    return `/api/download${encodeURI(file.path)}`
  } else {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.push("/login")
      return `/login`
    } else {
      return `/api/download${file.path}?token=${token}`
    }
  }
}
