import { useState } from 'react'
import { useAddItem } from '../hooks/useItems'
import ManualInput from './ManualInput'
import ShelfLifeCalc from './ShelfLifeCalc'
import TemplateSelector from './TemplateSelector'
import PhotoCapture from './PhotoCapture'

type TabKey = 'manual' | 'calc' | 'template' | 'photo'

interface Props {
  onClose: () => void
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'manual', label: '手动' },
  { key: 'calc', label: '计算' },
  { key: 'template', label: '模板' },
  { key: 'photo', label: '拍照' },
]

export default function AddItemModal({ onClose }: Props) {
  const [tab, setTab] = useState<TabKey>('manual')
  const [prefill, setPrefill] = useState<{ name?: string; expiry?: string } | null>(null)
  const addItem = useAddItem()

  async function handleSubmit(data: { name: string; expiry_date: string; production_date?: string; shelf_life_days?: number; notes?: string }) {
    await addItem.mutateAsync(data)
    onClose()
  }

  function handleCalcResult(expiryDate: string, _shelfLifeDays: number, _productionDate: string) {
    setPrefill({ expiry: expiryDate })
    setTab('manual')
  }

  function handleTemplateSelect(name: string, expiryDate: string) {
    setPrefill({ name, expiry: expiryDate })
    setTab('manual')
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">添加物品</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-1 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-8">
          {tab === 'manual' && (
            <ManualInput
              onSubmit={handleSubmit}
              loading={addItem.isPending}
              initialName={prefill?.name}
              initialExpiry={prefill?.expiry}
            />
          )}
          {tab === 'calc' && (
            <ShelfLifeCalc onResult={handleCalcResult} />
          )}
          {tab === 'template' && (
            <TemplateSelector onSelect={handleTemplateSelect} />
          )}
          {tab === 'photo' && (
            <PhotoCapture onSave={handleSubmit} saving={addItem.isPending} />
          )}
        </div>
      </div>
    </div>
  )
}
