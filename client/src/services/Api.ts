import { history } from "store"
import { Account } from "models/Account"
import { Directory, FsNode } from "models/FsNode"

const HEADERS = [
  ["Content-Type", "application/json"]
]

export type ApiError = BadRequest | Unauthorized

export type BadRequest = {
  type: "BadRequest"
  errors: FormErrors
}

export type Unauthorized = {
  type: "Unauthorized"
  message: string
}

export type Error = {
  type: "Error"
  message: string
}

export type FormErrors = Record<string, string[]>

function success(response: Response): Promise<any> {
  if (response.status >= 200 && response.status < 300) {
    return response.json()
  } else if (response.status === 400) {
    return new Promise((_, reject) => {
      return response.json().then(json => {
        reject({
          type: "BadRequest",
          errors: json
        })
      })
    })
  } else if (response.status === 404) {
    history.push("/notfound")
    return Promise.reject({
      type: "NotFound",
      message: response.statusText
    })
  } else {
    return Promise.reject({
      type: "Error",
      message: response.statusText
    })
  }
}

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

export interface AccountApiResponse {
  account: Account
  token: string
}

export function login(mail: string, password: string): Promise<Account> {
  return fetch(`/accounts/login`, {
    method: "POST",
    body: JSON.stringify({ mail, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success).then(response => {
    saveAuthToken(response.token)
    return response.account
  })
}

export function signup(login: string, mail: string, password: string): Promise<Account> {
  return fetch(`/accounts/signup`, {
    method: "POST",
    body: JSON.stringify({ login, mail, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success).then(response => {
    saveAuthToken(response.token)
    return response.account
  })
}


export function me(): Promise<Account> {
  return withAuth(`/accounts/me`, {
    method: "GET",
    headers: HEADERS,
  }).then(success)
}

export function createNewFolder(path: string): Promise<FsNode> {
  return withAuth(`/api/directory${path}`, {
    method: "POST",
    body: JSON.stringify({})
  }).then(success)
}

export function fetchDirectory(path: string): Promise<Directory> {
  return withAuth(`/api/directory${path}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success)
}

export function upload(path: string, file: Blob, progression?: (e: ProgressEvent) => void): Promise<FsNode> {
  return new Promise((resolve, reject) => {
    getAuthToken().then(token => {
      let xhr = new XMLHttpRequest()
      xhr.open("POST", `/api/upload${path}`)
      xhr.setRequestHeader("Authorization", token)
      xhr.addEventListener("load", event => {
        console.debug("upload load", event)
        resolve(JSON.parse((event.target) as any))
      })
      xhr.onerror = e => {
        console.debug("upload.onerror", e)
        reject({
          message: (e.target as any).responseText
        })
      }
      if (progression) {
        xhr.upload.addEventListener("progress", progression)
      }
      xhr.send(file)
    })
  })
}

export function getDownloadUrl(file: FsNode, cookie: boolean): string {
  if (cookie) {
    return `/api/download${file.location}`
  } else {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.push("/login")
      return `/login`
    } else {
      return `/api/download${file.location}?token=${token}`
    }
  }
}
