import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIES, CATEGORY_MAP } from '../data/categories'
import type { Category, CategorySlug } from '../data/types'

/**
 * Admin-managed Active/Inactive status for main categories.
 * Defaults come from the static `active` flag in data/categories.ts;
 * toggles from Admin → Categories persist in localStorage and immediately
 * change what the customer-facing navigation shows. Nothing is ever deleted.
 */

interface CategoryStatusState {
  /** slug → admin override; missing = use the static default */
  overrides: Record<string, boolean>
  setStatus: (slug: CategorySlug, active: boolean) => void
}

export const useCategoryStatus = create<CategoryStatusState>()(
  persist(
    (set) => ({
      overrides: {},
      setStatus: (slug, active) => set((s) => ({ overrides: { ...s.overrides, [slug]: active } })),
    }),
    { name: 'velvette-category-status-v1' },
  ),
)

export function isCategoryActive(slug?: string): boolean {
  if (!slug) return true
  const override = useCategoryStatus.getState().overrides[slug]
  if (override !== undefined) return override
  const c = CATEGORY_MAP[slug as CategorySlug]
  return c ? c.active !== false : true
}

/** Reactive: current active flag for one category (true when unknown). */
export function useCategoryActive(slug?: string): boolean {
  const override = useCategoryStatus((s) => (slug ? s.overrides[slug] : undefined))
  if (override !== undefined) return override
  const c = slug ? CATEGORY_MAP[slug as CategorySlug] : undefined
  return c ? c.active !== false : true
}

/** Reactive: every category currently visible to customers, in display order. */
export function useActiveCategories(): Category[] {
  const overrides = useCategoryStatus((s) => s.overrides)
  return CATEGORIES.filter((c) => overrides[c.slug] ?? c.active !== false)
}

/**
 * Link to a category page; if the category is inactive, fall back to a
 * customer-friendly equivalent so no storefront link dead-ends.
 */
export function categoryLink(slug: string): string {
  if (isCategoryActive(slug)) return `/category/${slug}`
  const FALLBACKS: Record<string, string> = {
    flowers: '/shop?q=flowers',
    bouquets: '/shop?q=bouquets',
    birthday: '/shop?occ=birthday',
    anniversary: '/shop?occ=anniversary',
    wedding: '/shop?occ=wedding',
    corporate: '/shop?occ=corporate',
    'same-day': '/shop?sameday=1',
    'new-arrivals': '/shop?sort=newest',
    'best-sellers': '/shop',
    combos: '/shop?q=combos',
  }
  return FALLBACKS[slug] ?? '/shop'
}

/** Resolve a stored `/category/...` path through categoryLink; other paths pass through. */
export function toStoreLink(path: string): string {
  if (!path.startsWith('/category/')) return path
  return categoryLink(path.slice('/category/'.length))
}
