import { useState } from 'react'
import ItemCard from './ItemCard'
import { useItems } from '../hooks/useItems'

export default function ItemList() {
  const { data: items, isLoading, isError, refetch } = useItems()
  const [activeTag, setActiveTag] = useState<string | null>(null)

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

  // Collect unique tags from items
  const tags = Array.from(new Set(items.map((i) => i.tag).filter(Boolean))) as string[]
  const filtered = activeTag ? items.filter((i) => i.tag === activeTag) : items

  return (
    <div className="flex flex-col">
      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTag === null
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-300 text-gray-600'
            }`}
          >
            全部
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === t
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">该分类暂无物品</div>
        )}
      </div>
    </div>
  )
}
