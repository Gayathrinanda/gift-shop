import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Banner, Coupon, Review } from '../data/types'
import { BANNERS, COUPONS, REVIEWS } from '../data/demo'
import { uid } from '../lib/utils'

/** Admin-managed collections (coupons, banners, reviews) persisted for the session. */

interface CouponsState {
  coupons: Coupon[]
  add: (c: Omit<Coupon, 'id'> & { code: string }) => void
  update: (code: string, patch: Partial<Coupon>) => void
  remove: (code: string) => void
}

export const useCoupons = create<CouponsState>()(
  persist(
    (set) => ({
      coupons: COUPONS,
      add: (c) => set((s) => ({ coupons: [{ ...c } as Coupon, ...s.coupons] })),
      update: (code, patch) =>
        set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, ...patch } : c)) })),
      remove: (code) => set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),
    }),
    { name: 'velvette-coupons-v1' },
  ),
)

interface BannersState {
  banners: Banner[]
  add: (b: Omit<Banner, 'id'>) => void
  update: (id: string, patch: Partial<Banner>) => void
  remove: (id: string) => void
}

export const useBanners = create<BannersState>()(
  persist(
    (set) => ({
      banners: BANNERS,
      add: (b) => set((s) => ({ banners: [...s.banners, { ...b, id: uid('bnr') }] })),
      update: (id, patch) =>
        set((s) => ({ banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      remove: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
    }),
    { name: 'velvette-banners-v1' },
  ),
)

interface ReviewsState {
  reviews: Review[]
  add: (r: Omit<Review, 'id' | 'date'>) => void
  toggleApproved: (id: string) => void
  remove: (id: string) => void
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: REVIEWS,
      add: (r) =>
        set((s) => ({
          reviews: [{ ...r, id: uid('rev'), date: new Date().toISOString().slice(0, 10), approved: true }, ...s.reviews],
        })),
      toggleApproved: (id) =>
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r)) })),
      remove: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
    }),
    { name: 'velvette-reviews-v1' },
  ),
)
