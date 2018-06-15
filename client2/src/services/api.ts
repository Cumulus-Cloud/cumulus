import { ApiError } from '../models/ApiError'
import { User } from '../models/User'

const Api = {

  post<B, R>(path: string, body: B): Promise<ApiError | R> {
    return fetch(`http://localhost:9000/api/${path}`,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json())
  },

  signIn(login: string, password: string): Promise<ApiError | User> {
    return this.post('users/login', { login, password })
  },

  signUp(login: string, email: string, password: string): Promise<ApiError | User> {
    return this.post('users/signup', { login, email, password })
  }
}

export default Api
