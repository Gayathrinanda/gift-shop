import { create } from 'zustand'
import type { Product } from '../data/types'
import { PRODUCTS } from '../data/products'
import { safeGet, safeSet } from '../lib/safeStorage'

const KEY = 'velvette-catalog-v1'

interface CatalogState {
  products: Product[]
  setProducts: (p: Product[]) => void
  addProduct: (p: Product) => void
  updateProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  resetCatalog: () => void
}

function load(): Product[] {
  const stored = safeGet<Product[] | null>(KEY, null)
  if (stored && Array.isArray(stored) && stored.length > 0) return stored
  return PRODUCTS
}

export const useCatalog = create<CatalogState>((set) => ({
  products: load(),
  setProducts: (p) => set({ products: p }),
  addProduct: (p) =>
    set((s) => {
      const next = [p, ...s.products]
      safeSet(KEY, next)
      return { products: next }
    }),
  updateProduct: (p) =>
    set((s) => {
      const next = s.products.map((x) => (x.id === p.id ? p : x))
      safeSet(KEY, next)
      return { products: next }
    }),
  deleteProduct: (id) =>
    set((s) => {
      const next = s.products.filter((x) => x.id !== id)
      safeSet(KEY, next)
      return { products: next }
    }),
  resetCatalog: () => {
    safeSet(KEY, PRODUCTS)
    set({ products: PRODUCTS })
  },
}))
