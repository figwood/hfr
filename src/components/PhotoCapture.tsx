import { useState, useRef } from 'react'
import { apiClient } from '../api/client'

interface RecognizeResult {
  name?: string
  production_date?: string
  shelf_life_days?: number
}

interface Props {
  onResult: (result: RecognizeResult) => void
}

export default function PhotoCapture({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)

    try {
      const base64 = await resizeAndEncode(file)
      setPreview(base64)

      const response = await apiClient.post<{ success: boolean; data?: RecognizeResult; raw?: string }>(
        '/ai/recognize',
        { image: base64 }
      )

      if (response.success && response.data) {
        onResult(response.data)
      } else {
        setError('识别结果不理想，请手动填写或重拍')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败')
    } finally {
      setLoading(false)
      // reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer active:bg-gray-50"
        onClick={() => inputRef.current?.click()}
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
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        识别结果仅供参考，请核对后确认
      </p>
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
