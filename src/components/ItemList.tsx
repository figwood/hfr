import ItemCard from './ItemCard'
import { useItems } from '../hooks/useItems'

export default function ItemList() {
  const { data: items, isLoading, isError, refetch } = useItems()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">加载失败</p>
        <button
          onClick={() => refetch()}
          className="text-green-600 font-medium"
        >
          重试
        </button>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-5xl mb-4">🥦</div>
        <p className="text-gray-500 text-base">还没有记录任何物品</p>
        <p className="text-gray-400 text-sm mt-1">点击下方 + 按钮开始添加</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
