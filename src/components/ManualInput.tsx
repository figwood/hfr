import { useState, useEffect } from 'react'
import { calcExpiryDate, todayISOString } from '../utils/dateUtils'

const PRESET_TAGS = ['食品', '饮料', '冷藏', '冷冻', '日用品', '药品', '护肤品', '其他']

interface Props {
  onSubmit: (data: { name: string; expiry_date: string; production_date?: string; shelf_life_days?: number; notes?: string; tag?: string }) => void
  loading?: boolean
  initialName?: string
  initialExpiry?: string
}

export default function ManualInput({ onSubmit, loading, initialName = '', initialExpiry = '' }: Props) {
  const [name, setName] = useState(initialName)
  const [productionDate, setProductionDate] = useState('')
  const [shelfLifeDays, setShelfLifeDays] = useState('')
  const [expiry, setExpiry] = useState(initialExpiry)
  const [notes, setNotes] = useState('')
  const [tag, setTag] = useState('')
  const [customTag, setCustomTag] = useState('')

  // Auto-calculate expiry when both production date and shelf life are filled
  useEffect(() => {
    if (productionDate && shelfLifeDays) {
      const days = parseInt(shelfLifeDays, 10)
      if (!isNaN(days) && days > 0) {
        setExpiry(calcExpiryDate(productionDate, days))
      }
    }
  }, [productionDate, shelfLifeDays])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !expiry) return
    const finalTag = tag === '__custom__' ? customTag.trim() : tag
    onSubmit({
      name,
      expiry_date: expiry,
      production_date: productionDate || undefined,
      shelf_life_days: shelfLifeDays ? parseInt(shelfLifeDays, 10) : undefined,
      notes: notes || undefined,
      tag: finalTag || undefined,
    })
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
        <label className="block text-sm font-medium text-gray-700 mb-1">生产日期（可选）</label>
        <input
          type="date"
          value={productionDate}
          onChange={(e) => setProductionDate(e.target.value)}
          max={today}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">保质期（天，可选）</label>
        <input
          type="number"
          value={shelfLifeDays}
          onChange={(e) => setShelfLifeDays(e.target.value)}
          min="1"
          placeholder="例：180"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          过期日期 *
          {productionDate && shelfLifeDays && (
            <span className="ml-2 text-xs text-green-600 font-normal">（已自动计算）</span>
          )}
        </label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">分类标签（可选）</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTag(tag === t ? '' : t); setCustomTag('') }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tag === t
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 active:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setTag(tag === '__custom__' ? '' : '__custom__') }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tag === '__custom__'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-300 text-gray-600 active:bg-gray-50'
            }`}
          >
            自定义
          </button>
        </div>
        {tag === '__custom__' && (
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="输入自定义标签"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}
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
