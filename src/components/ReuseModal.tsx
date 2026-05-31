import { useState } from 'react'
import { useReuseItem } from '../hooks/useItems'
import type { Item } from '../types'

interface Props {
  item: Item
  onClose: () => void
}

export default function ReuseModal({ item, onClose }: Props) {
  const [expiryDate, setExpiryDate] = useState(item.expiry_date)
  const reuse = useReuseItem()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await reuse.mutateAsync({ source: item, expiry_date: expiryDate })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">再来一个：{item.name}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新的过期日期</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={reuse.isPending || !expiryDate}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium disabled:opacity-50"
            >
              {reuse.isPending ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
