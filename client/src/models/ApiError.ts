
export interface AppError {
  key: string
  message: string
  errors?: Record<string, AppError[]>
  args: string[]
}

export function getErrorMessage(error: AppError): string {
  if (error.errors) {
    const firstKey = Object.keys(error.errors).pop()
    if (firstKey && error.errors[firstKey].length > 0) {
      return error.errors[firstKey][0].message
    } else {
      return error.message
    }
  } else {
    return error.message
  }
}
