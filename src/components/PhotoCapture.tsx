import { useState, useRef } from 'react'
import { apiClient } from '../api/client'
import { calcExpiryDate, todayISOString } from '../utils/dateUtils'

interface Props {
  onSave: (data: { name: string; expiry_date: string; notes?: string }) => void
  saving?: boolean
}

export default function PhotoCapture({ onSave, saving }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [recognized, setRecognized] = useState(false)
  // editable result fields
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [notes, setNotes] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    setRecognized(false)

    try {
      const base64 = await resizeAndEncode(file)
      setPreview(base64)

      const response = await apiClient.post<{
        success: boolean
        data?: { name?: string; production_date?: string; shelf_life_days?: number }
        raw?: string
      }>('/ai/recognize', { image: base64 })

      if (response.success && response.data) {
        const d = response.data
        setName(d.name ?? '')
        if (d.production_date && d.shelf_life_days) {
          setExpiry(calcExpiryDate(d.production_date, d.shelf_life_days))
        } else {
          setExpiry('')
        }
        setNotes('')
        setRecognized(true)
      } else {
        setError('识别结果不理想，请手动填写或重拍')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleReset() {
    setPreview(null)
    setRecognized(false)
    setName('')
    setExpiry('')
    setNotes('')
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !expiry) return
    onSave({ name, expiry_date: expiry, notes: notes || undefined })
  }

  const today = todayISOString()

  return (
    <div className="space-y-4">
      {/* Photo area */}
      <div
        className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
          recognized ? 'border-green-400 bg-green-50 cursor-default' : 'border-gray-300 cursor-pointer active:bg-gray-50'
        }`}
        onClick={recognized ? undefined : () => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="预览" className="h-full w-full object-contain rounded-2xl" />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <p className="text-sm text-gray-500 mt-2">点击拍照或选择图片</p>
            <p className="text-xs text-gray-400">自动识别物品名称和保质期</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          AI 识别中，请稍候...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
          <button
            className="ml-2 underline text-red-600 text-sm"
            onClick={() => inputRef.current?.click()}
          >
            重拍
          </button>
        </div>
      )}

      {/* Recognition result form */}
      {recognized && (
        <form onSubmit={handleSubmit} className="space-y-3 bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium mb-1">
            <span>✅</span>
            <span>识别成功，请核对信息后保存</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="请填写物品名称"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：超市买的"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 font-medium active:bg-gray-200 transition-colors"
            >
              重新拍照
            </button>
            <button
              type="submit"
              disabled={saving || !name || !expiry}
              className="flex-1 bg-green-600 text-white rounded-xl py-2.5 font-semibold disabled:opacity-50 active:bg-green-700 transition-colors"
            >
              {saving ? '保存中...' : '保存入库'}
            </button>
          </div>
        </form>
      )}

      {!recognized && !loading && !error && (
        <p className="text-xs text-gray-400 text-center">
          识别结果仅供参考，请核对后确认
        </p>
      )}
    </div>
  )
}

/** Resize image to max 1024px and return base64 data URL */
async function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}
