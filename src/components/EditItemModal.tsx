import type { Item } from '../types'
import { useUpdateItem } from '../hooks/useItems'
import ManualInput from './ManualInput'

interface Props {
  item: Item
  onClose: () => void
}

export default function EditItemModal({ item, onClose }: Props) {
  const updateItem = useUpdateItem()

  async function handleSubmit(data: {
    name: string
    expiry_date: string
    production_date?: string
    shelf_life_days?: number
    notes?: string
    tag?: string
  }) {
    await updateItem.mutateAsync({ id: item.id, ...data })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">编辑物品</h2>
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
            loading={updateItem.isPending}
            initialName={item.name}
            initialExpiry={item.expiry_date}
            initialProductionDate={item.production_date ?? ''}
            initialShelfLifeDays={item.shelf_life_days ? String(item.shelf_life_days) : ''}
            initialNotes={item.notes ?? ''}
            initialTag={item.tag ?? ''}
            submitLabel="保存修改"
            allowPastExpiry
          />
        </div>
      </div>
    </div>
  )
}
