import { ApiError } from '../models/ApiError'
import { User } from '../models/User'

const urlBase = 'http://localhost:9000'

const ApiUtils = {

  post<B, R>(path: string, body: B): Promise<ApiError | R> {
    return fetch(`${urlBase}/api${path}`,{
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json())
  },

  get<R>(path: string): Promise<ApiError | R> {
    return fetch(`${urlBase}/api${path}`,{
      method: 'GET',
      credentials: 'include'
    })
    .then((response) => response.json())
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
    }
  }

}

export default Api
