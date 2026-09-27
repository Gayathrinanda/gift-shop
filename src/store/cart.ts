import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Coupon } from '../data/types'
import { COUPONS } from '../data/demo'
import { useCatalog } from './products'
import { safeSet } from '../lib/safeStorage'

const FREE_DELIVERY_ABOVE = 999
const DELIVERY_FEE = 79
const EXPRESS_FEE = 149

export interface AppliedCoupon {
  code: string
  type: 'percent' | 'flat'
  value: number
}

interface CartState {
  items: CartItem[]
  coupon: AppliedCoupon | null
  deliveryMethod: 'standard' | 'same-day' | 'scheduled'
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void
  setGiftNote: (productId: string, note: string) => void
  applyCoupon: (code: string) => { ok: boolean; message: string }
  removeCoupon: () => void
  setDeliveryMethod: (m: 'standard' | 'same-day' | 'scheduled') => void
  clear: () => void
  saveForLater: (productId: string, variantId?: string) => void
  moveToCart: (productId: string) => void
  savedForLater: CartItem[]
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      coupon: null,
      deliveryMethod: 'standard',
      addItem: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.productId === item.productId && i.variantId === item.variantId)
          let items
          if (idx >= 0) {
            items = s.items.map((i, j) => (j === idx ? { ...i, qty: i.qty + item.qty } : i))
          } else {
            items = [...s.items, item]
          }
          safeSet('velvette-cart-backup', items)
          return { items }
        }),
      removeItem: (productId, variantId) =>
        set((s) => {
          const items = s.items.filter((i) => !(i.productId === productId && i.variantId === variantId))
          safeSet('velvette-cart-backup', items)
          return { items }
        }),
      updateQty: (productId, variantId, qty) =>
        set((s) => {
          const items = s.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i,
          )
          safeSet('velvette-cart-backup', items)
          return { items }
        }),
      setGiftNote: (productId, note) =>
        set((s) => {
          const items = s.items.map((i) => (i.productId === productId ? { ...i, giftNote: note } : i))
          safeSet('velvette-cart-backup', items)
          return { items }
        }),
      applyCoupon: (code) => {
        const clean = code.trim().toUpperCase()
        const coupon: Coupon | undefined = COUPONS.find((c) => c.code === clean && c.active)
        if (!coupon) return { ok: false, message: `“${clean}” is not a valid demo coupon.` }
        if (new Date(coupon.expiry) < new Date()) return { ok: false, message: 'This coupon has expired.' }
        const subtotal = get().subtotal()
        if (subtotal < coupon.minOrder) {
          return { ok: false, message: `Add ₹${coupon.minOrder - subtotal} more to use ${coupon.code}.` }
        }
        set({ coupon: { code: coupon.code, type: coupon.type, value: coupon.value } })
        return { ok: true, message: `${coupon.code} applied — ${coupon.description}.` }
      },
      removeCoupon: () => set({ coupon: null }),
      setDeliveryMethod: (m) => set({ deliveryMethod: m }),
      clear: () => set({ items: [], coupon: null, savedForLater: [] }),
      saveForLater: (productId, variantId) =>
        set((s) => {
          const item = s.items.find((i) => i.productId === productId && i.variantId === variantId)
          if (!item) return s
          return {
            items: s.items.filter((i) => i !== item),
            savedForLater: [item, ...s.savedForLater.filter((x) => x.productId !== item.productId)],
          }
        }),
      moveToCart: (productId) =>
        set((s) => {
          const item = s.savedForLater.find((i) => i.productId === productId)
          if (!item) return s
          return {
            savedForLater: s.savedForLater.filter((i) => i !== item),
            items: [...s.items, item],
          }
        }),
      subtotal: () =>
        get().items.reduce((sum, i) => {
          const p = useCatalog.getState().products.find((x) => x.id === i.productId)
          const v = p?.variants.find((v) => v.id === i.variantId)
          return sum + ((p?.price ?? 0) + (v?.priceDelta ?? 0)) * i.qty
        }, 0),
    }),
    {
      name: 'velvette-cart-v1',
      partialize: (s) => ({ items: s.items, coupon: s.coupon, deliveryMethod: s.deliveryMethod, savedForLater: s.savedForLater }),
    },
  ),
)

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0)
}

/** Single source of truth for delivery pricing (shared with Checkout). */
export function deliveryFeeFor(method: string, subtotal: number) {
  if (subtotal === 0) return 0
  if (method === 'same-day') return EXPRESS_FEE
  return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
}

export function computeTotals(state: { items: CartItem[]; coupon: AppliedCoupon | null; deliveryMethod: string }) {
  const catalog = useCatalog.getState().products
  const subtotal = state.items.reduce((sum, i) => {
    const p = catalog.find((x) => x.id === i.productId)
    const v = p?.variants.find((v) => v.id === i.variantId)
    return sum + ((p?.price ?? 0) + (v?.priceDelta ?? 0)) * i.qty
  }, 0)
  let discount = 0
  if (state.coupon && subtotal > 0) {
    discount = state.coupon.type === 'percent' ? Math.round((subtotal * state.coupon.value) / 100) : state.coupon.value
    discount = Math.min(discount, subtotal)
  }
  const delivery = deliveryFeeFor(state.deliveryMethod, subtotal)
  const total = subtotal - discount + delivery
  return { subtotal, discount, delivery, total }
}
