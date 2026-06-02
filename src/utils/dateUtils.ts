import type { ItemStatus } from '../types'

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getItemStatus(expiryDate: string, warningDays = 3): ItemStatus {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return 'expired'
  if (days <= warningDays) return 'warning'
  return 'safe'
}

export function formatExpiryLabel(days: number): string {
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  if (days === 1) return '明天到期'
  return `还剩 ${days} 天`
}

/** Add shelf_life_days to a production date string, return YYYY-MM-DD */
export function calcExpiryDate(
  productionDate: string,
  shelfLifeDays: number
): string {
  const d = new Date(productionDate)
  d.setDate(d.getDate() + shelfLifeDays)
  return d.toISOString().slice(0, 10)
}

/** Add months to a production date string, return YYYY-MM-DD */
export function calcExpiryDateByMonths(
  productionDate: string,
  months: number
): string {
  const d = new Date(productionDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function todayISOString(): string {
  return new Date().toISOString().slice(0, 10)
}
