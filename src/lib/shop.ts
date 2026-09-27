import type { Product } from '../data/types'

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'popular' | 'discount'

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
]

export interface Filters {
  q?: string
  subcats: string[]
  priceMin?: number
  priceMax?: number
  rating?: number
  inStockOnly?: boolean
  occasions: string[]
  colors: string[]
  sameDayOnly?: boolean
  sort: SortKey
}

export const EMPTY_FILTERS: Filters = {
  subcats: [],
  occasions: [],
  colors: [],
  sort: 'relevance',
}

export function applyFilters(products: Product[], f: Filters): Product[] {
  const term = f.q?.trim().toLowerCase()
  let out = products.filter((p) => {
    if (term) {
      const hay = `${p.name} ${p.category} ${p.subcategory} ${p.tags.join(' ')} ${p.occasions.join(' ')}`.toLowerCase()
      if (!hay.includes(term)) return false
    }
    if (f.subcats.length && !f.subcats.includes(p.subcategory)) return false
    if (f.priceMin !== undefined && p.price < f.priceMin) return false
    if (f.priceMax !== undefined && p.price > f.priceMax) return false
    if (f.rating && p.rating < f.rating) return false
    if (f.inStockOnly && p.stock === 0) return false
    if (f.occasions.length && !p.occasions.some((o) => f.occasions.includes(o))) return false
    if (f.colors.length && (!p.color || !f.colors.includes(p.color))) return false
    if (f.sameDayOnly && !p.sameDay) return false
    return true
  })

  switch (f.sort) {
    case 'price-asc': out.sort((a, b) => a.price - b.price); break
    case 'price-desc': out.sort((a, b) => b.price - a.price); break
    case 'newest': out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
    case 'rating': out.sort((a, b) => b.rating - a.rating); break
    case 'popular': out.sort((a, b) => b.reviewCount - a.reviewCount); break
    case 'discount':
      out.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0
        return db - da
      })
      break
    default:
      out.sort((a, b) => Number(b.bestSeller ?? false) - Number(a.bestSeller ?? false) || Number(b.featured ?? false) - Number(a.featured ?? false))
  }
  return out
}

export function activeFilterChips(f: Filters): Array<{ label: string; clear: (f: Filters) => Filters }> {
  const chips: Array<{ label: string; clear: (f: Filters) => Filters }> = []
  if (f.q) chips.push({ label: `“${f.q}”`, clear: (ff) => ({ ...ff, q: undefined }) })
  f.subcats.forEach((s) => chips.push({ label: s, clear: (ff) => ({ ...ff, subcats: ff.subcats.filter((x) => x !== s) }) }))
  f.occasions.forEach((o) => chips.push({ label: `Occasion: ${o}`, clear: (ff) => ({ ...ff, occasions: ff.occasions.filter((x) => x !== o) }) }))
  f.colors.forEach((c) => chips.push({ label: `Colour: ${c}`, clear: (ff) => ({ ...ff, colors: ff.colors.filter((x) => x !== c) }) }))
  if (f.priceMin !== undefined || f.priceMax !== undefined) {
    chips.push({
      label: `${f.priceMin !== undefined ? '₹' + f.priceMin : '₹0'} – ${f.priceMax !== undefined ? '₹' + f.priceMax : '₹5,000+'}`,
      clear: (ff) => ({ ...ff, priceMin: undefined, priceMax: undefined }),
    })
  }
  if (f.rating) chips.push({ label: `${f.rating}★ & up`, clear: (ff) => ({ ...ff, rating: undefined }) })
  if (f.inStockOnly) chips.push({ label: 'In stock', clear: (ff) => ({ ...ff, inStockOnly: undefined }) })
  if (f.sameDayOnly) chips.push({ label: 'Same-day', clear: (ff) => ({ ...ff, sameDayOnly: undefined }) })
  return chips
}
