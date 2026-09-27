import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  ids: string[]
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [id, ...s.ids] })),
      add: (id) => set((s) => (s.ids.includes(id) ? s : { ids: [id, ...s.ids] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'velvette-wishlist-v1' },
  ),
)

interface RecentState {
  ids: string[]
  push: (id: string) => void
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 12) })),
    }),
    { name: 'velvette-recent-v1' },
  ),
)

interface SearchHistoryState {
  recent: string[]
  push: (q: string) => void
  clear: () => void
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      push: (q) =>
        set((s) => {
          const clean = q.trim()
          if (!clean) return s
          return { recent: [clean, ...s.recent.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 8) }
        }),
      clear: () => set({ recent: [] }),
    }),
    { name: 'velvette-search-history-v1' },
  ),
)
