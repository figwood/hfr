import { useState, useEffect } from 'react'
import { calcExpiryDate, calcExpiryDateByMonths, todayISOString } from '../utils/dateUtils'

const BASE_TAGS = ['食品', '饮料', '日用品', '药品', '护肤品', '调料', '其他']
const CUSTOM_TAGS_KEY = 'hfr_custom_tags'

function loadCustomTags(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveCustomTag(tag: string): void {
  const tags = loadCustomTags()
  if (!tags.includes(tag)) {
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify([...tags, tag]))
  }
}

interface Props {
  onSubmit: (data: { name: string; expiry_date: string; production_date?: string; shelf_life_days?: number; notes?: string; tag?: string }) => void
  loading?: boolean
  initialName?: string
  initialExpiry?: string
  initialProductionDate?: string
  initialShelfLifeDays?: string
  initialNotes?: string
  initialTag?: string
  submitLabel?: string
  allowPastExpiry?: boolean
}

export default function ManualInput({
  onSubmit,
  loading,
  initialName = '',
  initialExpiry = '',
  initialProductionDate = '',
  initialShelfLifeDays = '',
  initialNotes = '',
  initialTag = '',
  submitLabel = '添加物品',
  allowPastExpiry = false,
}: Props) {
  const [savedCustomTags] = useState<string[]>(() => loadCustomTags())

  function resolveInitialTag() {
    if (!initialTag) return { tag: '', customTag: '' }
    if ([...BASE_TAGS, ...loadCustomTags()].includes(initialTag)) {
      return { tag: initialTag, customTag: '' }
    }
    return { tag: '__custom__', customTag: initialTag }
  }

  const { tag: initTag, customTag: initCustomTag } = resolveInitialTag()

  const [name, setName] = useState(initialName)
  const [productionDate, setProductionDate] = useState(initialProductionDate)
  const [shelfLifeValue, setShelfLifeValue] = useState(initialShelfLifeDays)
  const [shelfLifeUnit, setShelfLifeUnit] = useState<'days' | 'months'>('days')
  const [expiry, setExpiry] = useState(initialExpiry)
  const [notes, setNotes] = useState(initialNotes)
  const [tag, setTag] = useState(initTag)
  const [customTag, setCustomTag] = useState(initCustomTag)

  // Auto-calculate expiry when both production date and shelf life are filled
  useEffect(() => {
    if (productionDate && shelfLifeValue) {
      const val = parseInt(shelfLifeValue, 10)
      if (!isNaN(val) && val > 0) {
        if (shelfLifeUnit === 'days') {
          setExpiry(calcExpiryDate(productionDate, val))
        } else {
          setExpiry(calcExpiryDateByMonths(productionDate, val))
        }
      }
    }
  }, [productionDate, shelfLifeValue, shelfLifeUnit])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !expiry) return
    const finalTag = tag === '__custom__' ? customTag.trim() : tag
    if (tag === '__custom__' && customTag.trim()) {
      saveCustomTag(customTag.trim())
    }
    // Convert shelf life to days for storage
    let shelfLifeDays: number | undefined
    if (shelfLifeValue) {
      const val = parseInt(shelfLifeValue, 10)
      if (!isNaN(val) && val > 0) {
        if (shelfLifeUnit === 'months') {
          // Calculate actual days between production date and computed expiry
          if (productionDate) {
            const start = new Date(productionDate)
            const end = new Date(expiry)
            shelfLifeDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          } else {
            shelfLifeDays = Math.round(val * 30.44)
          }
        } else {
          shelfLifeDays = val
        }
      }
    }
    onSubmit({
      name,
      expiry_date: expiry,
      production_date: productionDate || undefined,
      shelf_life_days: shelfLifeDays,
      notes: notes || undefined,
      tag: finalTag || undefined,
    })
  }

  const today = todayISOString()
  const allTags = [...BASE_TAGS, ...savedCustomTags]

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
        <label className="block text-sm font-medium text-gray-700 mb-1">保质期（可选）</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={shelfLifeValue}
            onChange={(e) => setShelfLifeValue(e.target.value)}
            min="1"
            placeholder={shelfLifeUnit === 'days' ? '例：180' : '例：6'}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex rounded-xl border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setShelfLifeUnit('days')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                shelfLifeUnit === 'days'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 active:bg-gray-50'
              }`}
            >
              天
            </button>
            <button
              type="button"
              onClick={() => setShelfLifeUnit('months')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                shelfLifeUnit === 'months'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 active:bg-gray-50'
              }`}
            >
              月
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          过期日期 *
          {productionDate && shelfLifeValue && (
            <span className="ml-2 text-xs text-green-600 font-normal">（已自动计算）</span>
          )}
        </label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
          min={allowPastExpiry ? undefined : today}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">分类标签（可选）</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
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
            placeholder="输入自定义标签，下次将自动出现"
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
        {loading ? '保存中...' : submitLabel}
      </button>
    </form>
  )
}
