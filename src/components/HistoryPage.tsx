import { useState } from 'react'
import { useHistory, useDeleteItem } from '../hooks/useItems'
import ReuseModal from './ReuseModal'
import type { Item } from '../types'

export default function HistoryPage() {
  const { data: items, isLoading } = useHistory()
  const deleteItem = useDeleteItem()
  const [reuseTarget, setReuseTarget] = useState<Item | null>(null)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-gray-500 text-base">暂无消耗记录</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                过期：{item.expiry_date}
                {item.consumed_at && ` · 消耗：${item.consumed_at.slice(0, 10)}`}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setReuseTarget(item)}
                className="text-sm text-green-600 font-medium px-3 py-1.5 rounded-lg bg-green-50 active:bg-green-100"
              >
                再来一个
              </button>
              <button
                onClick={() => deleteItem.mutate(item.id)}
                disabled={deleteItem.isPending}
                className="text-sm text-red-500 font-medium px-3 py-1.5 rounded-lg bg-red-50 active:bg-red-100 disabled:opacity-50"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {reuseTarget && (
        <ReuseModal item={reuseTarget} onClose={() => setReuseTarget(null)} />
      )}
    </>
  )
}
