import { history } from "store"
import { Account } from "../models/Account"
// import { Directory, FsNode } from "../models/FsNode"

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

export function success(response: Response): Promise<any> {
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
      type: "Unauthorized",
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
/*
function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      history.push("#/login")
      reject({
        message: "Unauthorized"
      })
    } else {
      resolve(token)
    }
  })
}

function withAuth(path: string, options?: RequestInit, headers?: Headers): Promise<any> {
  return getAuthToken().then(token => {
    return fetch(path, {
      ...options,
      headers: {
        "Authorization": token,
        ...headers
      },
      credentials: "same-origin",
    })
  })
}
*/
export function saveAuthToken(token: string, session: boolean = false) {
  (session ? sessionStorage : localStorage).setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function json(response: Response) {
  console.debug("json", response)
  return response.json()
}

export interface AccountApiResponse {
  account: Account
  token: string
}

export function login(mail: string, password: string): Promise<AccountApiResponse> {
  return fetch(`/accounts/login`, {
    method: "POST",
    body: JSON.stringify({ mail, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success)
}

export function signup(login: string, mail: string, password: string): Promise<AccountApiResponse> {
  return fetch(`/accounts/signup`, {
    method: "POST",
    body: JSON.stringify({ login, mail, password }),
    headers: HEADERS,
    credentials: "same-origin",
  }).then(success)
}

/*
export function me(): Promise<Account> {
  return withAuth(`${BASE_API_URL}/accounts/me`, {
    method: "GET",
    headers: HEADERS,
  }).then(success)
}

export function directory(path: string): Promise<Directory> {
  return withAuth(`${BASE_API_URL}/api/directory/${path}`, {
    method: "GET",
    headers: HEADERS,
  }).then(success)
}

export function createDirectory(path: string): Promise<FsNode> {
  return withAuth(`${BASE_API_URL}/api/directory${path}`, {
    method: "POST"
  }).then(success)
}

export function upload(path: string, file: Blob, progression?: (e: ProgressEvent) => void): Promise<FsNode> {
  return getAuthToken().then(token => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.open("POST", `${BASE_API_URL}/api/upload${path}`)
      xhr.setRequestHeader("Authorization", token)
      xhr.addEventListener("load", function (e: any) {
        console.debug("upload load", e)
        resolve(JSON.parse(e.target.response))
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
    return `${BASE_API_URL}/api/download${file.location}`
  } else {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (!token) {
      hashHistory.push("/login")
      return `${BASE_API_URL}/login`
    } else {
      return `${BASE_API_URL}/api/download${file.location}?token=${token}`
    }
  }
}
*/