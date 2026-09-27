import { create } from 'zustand'

export interface Toast {
  id: number
  title: string
  description?: string
  kind: 'success' | 'error' | 'info'
}

let toastId = 0

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { ...t, id }].slice(-4) }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) => useToasts.getState().push({ title, description, kind: 'success' }),
  error: (title: string, description?: string) => useToasts.getState().push({ title, description, kind: 'error' }),
  info: (title: string, description?: string) => useToasts.getState().push({ title, description, kind: 'info' }),
}

/** Global cart-fly / burst effect trigger. */
export type Burst = { id: number; x: number; y: number; kind: 'cart' | 'heart' } | null

export interface QuickViewState { product: import('../data/types').Product }

interface UiState {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  burst: Burst
  fireBurst: (x: number, y: number, kind: 'cart' | 'heart') => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  quickView: QuickViewState | null
  setQuickView: (p: import('../data/types').Product) => void
  closeQuickView: () => void
}

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  burst: null,
  fireBurst: (x, y, kind) => set({ burst: { id: Date.now(), x, y, kind } }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  quickView: null,
  setQuickView: (p) => set({ quickView: { product: p } }),
  closeQuickView: () => set({ quickView: null }),
}))
