import { Validator } from "validation.ts"
import { history } from "store"

function validate<T>(value: T, validator: Validator<T>) {
  const result = validator.validate(value)
  if (result.isOk()) {
    return Promise.resolve(value)
  } else {
    const error = result.get()
    console.error("Response json error", error, value, validator)
    return Promise.reject(error)
  }
}

export function success<T>(validator: Validator<T>) {
  return function (response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json().then(response => validate(response, validator))
    } else if (response.status === 403) {
      history.replace("/login")
      return response.json().then(error => Promise.reject(error))
    } else {
      return response.json().then(error => Promise.reject(error))
    }
  }
}
