import _validate = require("validate.js")

export type ValidationErrors<T> = {
  [P in keyof T]?: string[]
}

export function validate<T>(model: T, constraints: any): ValidationErrors<T> | undefined {
  return (_validate as any)(model, constraints)
}

export function getError<T>(field: keyof T, errors: ValidationErrors<T>): string[] | undefined {
  return errors[field]
}
