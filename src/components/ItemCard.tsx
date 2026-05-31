import { useState, useRef } from 'react'
import type { Item } from '../types'
import { daysUntilExpiry, getItemStatus, formatExpiryLabel } from '../utils/dateUtils'
import { useConsumeItem } from '../hooks/useItems'

interface Props {
  item: Item
  warningDays?: number
}

const STATUS_STYLES = {
  expired: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    days: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    days: 'text-yellow-600',
  },
  safe: {
    bg: 'bg-white',
    border: 'border-gray-200',
    badge: 'bg-green-100 text-green-700',
    days: 'text-green-600',
  },
}

export default function ItemCard({ item, warningDays = 3 }: Props) {
  const consume = useConsumeItem()
  const [swipeX, setSwipeX] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const startX = useRef<number | null>(null)

  const days = daysUntilExpiry(item.expiry_date)
  const status = getItemStatus(item.expiry_date, warningDays)
  const styles = STATUS_STYLES[status]

  // Touch swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setSwipeX(Math.max(dx, -80))
  }
  function onTouchEnd() {
    if (swipeX < -50) {
      setConfirming(true)
    }
    setSwipeX(0)
    startX.current = null
  }

  function handleConsume() {
    consume.mutate(item.id)
    setConfirming(false)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Swipe-reveal consume button */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-green-500 flex items-center justify-center rounded-r-2xl">
          <span className="text-white text-xs font-medium">吃掉了</span>
        </div>

        <div
          className={`relative ${styles.bg} border ${styles.border} rounded-2xl p-4 transition-transform duration-150`}
          style={{ transform: `translateX(${swipeX}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.expiry_date}</p>
              {item.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.notes}</p>}
            </div>

            <div className="flex-shrink-0 text-right">
              <span className={`text-sm font-bold ${styles.days}`}>
                {formatExpiryLabel(days)}
              </span>
              <div className={`mt-1 text-xs rounded-full px-2 py-0.5 inline-block ${styles.badge}`}>
                {status === 'expired' ? '已过期' : status === 'warning' ? '即将到期' : '安全'}
              </div>
            </div>

            <button
              onClick={() => setConfirming(true)}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 active:bg-gray-200"
              aria-label="标记消耗"
            >
              ✓
            </button>
          </div>
        </div>
      </div>

      {/* Confirm consume modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4">
            <p className="text-base font-semibold text-center text-gray-900">
              「{item.name}」已吃掉/用完了？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleConsume}
                disabled={consume.isPending}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium disabled:opacity-50"
              >
                {consume.isPending ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
