import { useAddItem } from '../hooks/useItems'
import ManualInput from './ManualInput'

interface Props {
  onClose: () => void
}

export default function AddItemModal({ onClose }: Props) {
  const addItem = useAddItem()

  async function handleSubmit(data: { name: string; expiry_date: string; production_date?: string; shelf_life_days?: number; notes?: string; tag?: string }) {
    await addItem.mutateAsync(data)
    onClose()
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

        {/* Content */}
        <div className="px-5 pb-8">
          <ManualInput
            onSubmit={handleSubmit}
            loading={addItem.isPending}
          />
        </div>
      </div>
    </div>
  )
}
