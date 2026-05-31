import { useState } from 'react'
import { todayISOString } from '../utils/dateUtils'

interface Props {
  onSubmit: (data: { name: string; expiry_date: string; notes?: string }) => void
  loading?: boolean
  initialName?: string
  initialExpiry?: string
}

export default function ManualInput({ onSubmit, loading, initialName = '', initialExpiry = '' }: Props) {
  const [name, setName] = useState(initialName)
  const [expiry, setExpiry] = useState(initialExpiry)
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !expiry) return
    onSubmit({ name, expiry_date: expiry, notes: notes || undefined })
  }

  const today = todayISOString()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="例：牛奶、洗发水"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">过期日期 *</label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
          min={today}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例：超市买的"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name || !expiry}
        className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50 active:bg-green-700 transition-colors"
      >
        {loading ? '保存中...' : '添加物品'}
      </button>
    </form>
  )
}
