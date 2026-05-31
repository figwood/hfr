import { TEMPLATES } from '../data/templates'
import { calcExpiryDate, todayISOString } from '../utils/dateUtils'
import type { Template } from '../types'

interface Props {
  onSelect: (name: string, expiryDate: string, shelfLifeDays: number) => void
}

export default function TemplateSelector({ onSelect }: Props) {
  function handleClick(tpl: Template) {
    const expiry = calcExpiryDate(todayISOString(), tpl.shelf_life_days)
    onSelect(tpl.name, expiry, tpl.shelf_life_days)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">从今天起自动计算过期日期</p>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.name}
            onClick={() => handleClick(tpl)}
            className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl p-3 active:bg-green-50 active:border-green-300 transition-colors"
          >
            <span className="text-sm font-medium text-gray-800">{tpl.name}</span>
            <span className="text-xs text-gray-400 mt-0.5">
              {tpl.shelf_life_days >= 30
                ? `${Math.round(tpl.shelf_life_days / 30)}个月`
                : `${tpl.shelf_life_days}天`}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
