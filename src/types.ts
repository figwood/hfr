export interface Item {
  id: string
  user_id: string
  name: string
  expiry_date: string         // YYYY-MM-DD
  production_date?: string    // YYYY-MM-DD
  shelf_life_days?: number
  status: 'active' | 'consumed'
  created_at: string
  consumed_at?: string
  notes?: string
}

export type ItemStatus = 'expired' | 'warning' | 'safe'

export interface Template {
  name: string
  shelf_life_days: number
}

export interface JwtPayload {
  sub: string
  username: string
  exp: number
}
