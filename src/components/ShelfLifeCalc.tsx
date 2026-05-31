import { useState } from 'react'
import { calcExpiryDate, todayISOString } from '../utils/dateUtils'

interface Props {
  onResult: (expiryDate: string, shelfLifeDays: number, productionDate: string) => void
}

export default function ShelfLifeCalc({ onResult }: Props) {
  const [productionDate, setProductionDate] = useState(todayISOString())
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<'days' | 'months'>('days')

  const today = todayISOString()

  function handleCalc() {
    if (!productionDate || !amount) return
    const days = unit === 'months' ? Math.round(parseFloat(amount) * 30) : parseInt(amount, 10)
    if (isNaN(days) || days <= 0) return
    const expiry = calcExpiryDate(productionDate, days)
    onResult(expiry, days, productionDate)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">生产日期</label>
        <input
          type="date"
          value={productionDate}
          onChange={(e) => setProductionDate(e.target.value)}
          max={today}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">保质期</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="数量"
            min="1"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'days' | 'months')}
            className="rounded-xl border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="days">天</option>
            <option value="months">月</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleCalc}
        disabled={!productionDate || !amount}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50 active:bg-blue-700 transition-colors"
      >
        计算过期日期
      </button>
    </div>
  )
}
