import { history } from "store"
import { Validator } from "validation.ts"
import { User, userValidator } from "models/User"
import { object, string } from "validation.ts"
import { FsNode, FsNodeValidator } from "models/FsNode"
import { Promise } from "es6-shim"

const HEADERS = [
  ["Content-Type", "application/json"]
]

export interface ApiError {
  key: string
  message: string
  errors: Record<string, ApiError[]>
  args: string[]
}

function success<T = any>(validator: Validator<T>) {
  return function (response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json().then(response => validate(response, validator))
    } else {
      return response.json().then<any>(error => Promise.reject(error))
    }
  }
}

export function validate<T>(value: T, validator: Validator<T>) {
  const result = validator.validate(value)
  if (result.isOk()) {
    return Promise.resolve(value)
  } else {
    return Promise.reject(result.get())
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

export const userApiResponse = object({
  user: userValidator,
  token: string
})
export function login(login: string, password: string): Promise<User> {
  return fetch(`/users/login`, {
    method: "POST",
    body: JSON.stringify({ login, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success(userValidator)).then(response => {
    saveAuthToken(response.token)
    return response.user
  })
}

export function signup(login: string, email: string, password: string): Promise<User> {
  return fetch(`/users/signup`, {
    method: "POST",
    body: JSON.stringify({ login, email, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success(userValidator)).then(response => {
    saveAuthToken(response.token)
    return response.user
  })
}


export function me(): Promise<User> {
  return withAuth(`/accounts/me`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(userValidator))
}

export function createNewFolder(path: string): Promise<FsNode> {
  return withAuth(`/api/fs${path}`, {
    method: "POST",
    body: JSON.stringify({})
  }).then(success(FsNodeValidator))
}

export function fetchDirectory(path: string): Promise<FsNode> {
  return withAuth(`/api/fs${path}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success(FsNodeValidator))
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
    return `/api/download${file.path}`
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
