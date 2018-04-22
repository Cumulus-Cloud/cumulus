export interface ApiError {
  key: string
  message: string
  errors: Record<string, ApiError[]>
  args: string[]
}
