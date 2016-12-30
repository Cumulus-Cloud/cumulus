import { Account, AccountLogin, AccountSignup } from "../models/Account"
import { Directory } from "../models/FsNode"
import { hashHistory } from "react-router"

const BASE_API_URL = "http://localhost:9000"

const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
}

export interface ApiError<T> {
  errors?: T,
  onmessage?: string
}

export function success(response: Response): Promise<any> {
  if (response.status >= 200 && response.status < 300) {
    return response.json()
  } else if (response.status === 400) {
    return new Promise((_, reject) => {
      return response.json().then(json => {
        reject({
          errors: json
        })
      })
    })
  } else {
    return Promise.reject({
      message: response.statusText
    })
  }
}

const AUTH_TOKEN_STORAGE_KEY = "AUTH_TOKEN_STORAGE_KEY"

function withAuth(path: string, options?: RequestInit, headers?: Headers): Promise<any> {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  if (!token) {
    hashHistory.push("/login")
    return Promise.reject({
      message: "Unauthorized"
    })
  } else {
    return fetch(path, {
      ...options,
      headers: {
        "Authorization": token,
        ...HEADERS,
        ...headers
      }
    }).then(success)
  }
}

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
export function login(accountLogin: AccountLogin): Promise<AccountApiResponse> {
  return fetch(`${BASE_API_URL}/accounts/login`, {
    method: "POST",
    body: JSON.stringify(accountLogin),
    headers: HEADERS,
  }).then(success)
}

export function signup(accountSignup: AccountSignup): Promise<AccountApiResponse> {
  return fetch(`${BASE_API_URL}/accounts/signup`, {
    method: "POST",
    body: JSON.stringify(accountSignup),
    headers: HEADERS,
  }).then(success)
}

export function me(): Promise<Account> {
  return withAuth(`${BASE_API_URL}/accounts/me`, {
    method: "GET"
  })
}

export function directory(path: string): Promise<Directory> {
  return withAuth(`${BASE_API_URL}/api/directory/${path}`, {
    method: "GET"
  })
}
