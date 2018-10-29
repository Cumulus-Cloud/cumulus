
export interface ApiError {
  key: string
  message: string
  errors: Record<string, ApiError[]>
  args: string[]
}

export function getErrorMessage(error: ApiError): string {
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
