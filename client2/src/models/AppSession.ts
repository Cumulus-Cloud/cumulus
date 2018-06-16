
export interface AppSessionLocation {
  since: string,
  to: string,
  address: String
}

export interface AppExpirableSession {
  id: string
  owner: string
  since: string
  expire: string
  lastActivity: string,
  duration: number,
  refreshed: number,
  revoked: boolean,
  locations: AppSessionLocation[]
}

export interface AppInfiniteSession {
  id: string
  owner: string
  since: string
  lastActivity: string,
  refreshed: number,
  revoked: boolean,
  locations: AppSessionLocation[]
}

export type AppSession = AppExpirableSession | AppInfiniteSession
