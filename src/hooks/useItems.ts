import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { Item } from '../types'

const ITEMS_KEY = ['items']
const HISTORY_KEY = ['history']

function randomId(): string {
  return crypto.randomUUID()
}

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_KEY,
    queryFn: () => apiClient.get<Item[]>('/items'),
  })
}

export function useHistory() {
  return useQuery<Item[]>({
    queryKey: HISTORY_KEY,
    queryFn: () => apiClient.get<Item[]>('/history'),
  })
}

export function useAddItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Item, 'id' | 'user_id' | 'status' | 'created_at' | 'consumed_at'>) =>
      apiClient.post<Item>('/items', { ...data, id: randomId() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useConsumeItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<Item>(`/items/${id}`, { status: 'consumed' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ITEMS_KEY })
      const prev = qc.getQueryData<Item[]>(ITEMS_KEY)
      qc.setQueryData<Item[]>(ITEMS_KEY, (old) => old?.filter((i) => i.id !== id) ?? [])
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(ITEMS_KEY, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
      qc.invalidateQueries({ queryKey: HISTORY_KEY })
    },
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Item> & { id: string }) =>
      apiClient.patch<Item>(`/items/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useReuseItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      source,
      expiry_date,
    }: {
      source: Item
      expiry_date: string
    }) =>
      apiClient.post<Item>('/items', {
        id: randomId(),
        name: source.name,
        expiry_date,
        production_date: undefined,
        shelf_life_days: source.shelf_life_days,
        notes: source.notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY })
      qc.invalidateQueries({ queryKey: HISTORY_KEY })
    },
  })
}
