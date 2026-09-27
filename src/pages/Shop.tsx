import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link, useParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, CATEGORY_MAP } from '../data/categories'
import { useCatalog } from '../store/products'
import ProductCard from '../components/ui/ProductCard'
import { SkeletonGrid, EmptyState } from '../components/ui/misc'
import CategoryEntrance from '../components/animations/CategoryEntrance'
import PageTransition from '../components/animations/PageTransition'
import { applyFilters, activeFilterChips, EMPTY_FILTERS, SORT_OPTIONS } from '../lib/shop'
import type { Filters, SortKey } from '../lib/shop'
import type { CategorySlug } from '../data/types'
import { useMotionSafe } from '../lib/motion'

const ALL_OCCASIONS = ['birthday', 'anniversary', 'wedding', 'congratulations', 'thank-you', 'corporate', 'love-romance', 'get-well', 'housewarming', 'just-because']
const ALL_COLORS = ['Red', 'Pink', 'White', 'Yellow', 'Purple', 'Peach', 'Mixed']

export default function Shop({ categorySlug: categorySlugProp }: { categorySlug?: string }) {
  const params = useParams<{ categorySlug: string }>()
  const categorySlug = categorySlugProp ?? params.categorySlug
  const products = useCatalog((s) => s.products)
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(12)
  const motionSafe = useMotionSafe()

  const category = categorySlug ? CATEGORY_MAP[categorySlug as CategorySlug] : undefined

  // Initialize + URL-sync filters
  const filters: Filters = useMemo(() => {
    const f: Filters = { ...EMPTY_FILTERS }
    f.q = searchParams.get('q') ?? undefined
    f.subcats = searchParams.getAll('sub').filter(Boolean)
    f.occasions = searchParams.getAll('occ').filter(Boolean)
    f.colors = searchParams.getAll('color').filter(Boolean)
    f.rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined
    f.priceMin = searchParams.get('min') ? Number(searchParams.get('min')) : undefined
    f.priceMax = searchParams.get('max') ? Number(searchParams.get('max')) : undefined
    f.inStockOnly = searchParams.get('stock') === '1' || undefined
    f.sameDayOnly = searchParams.get('sameday') === '1' || undefined
    f.sort = (searchParams.get('sort') as SortKey) || 'relevance'
    return f
  }, [searchParams])

  const setFilters = (next: Filters) => {
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    next.subcats.forEach((s) => params.append('sub', s))
    next.occasions.forEach((o) => params.append('occ', o))
    next.colors.forEach((c) => params.append('color', c))
    if (next.rating) params.set('rating', String(next.rating))
    if (next.priceMin !== undefined) params.set('min', String(next.priceMin))
    if (next.priceMax !== undefined) params.set('max', String(next.priceMax))
    if (next.inStockOnly) params.set('stock', '1')
    if (next.sameDayOnly) params.set('sameday', '1')
    if (next.sort !== 'relevance') params.set('sort', next.sort)
    setSearchParams(params)
    setVisible(12)
  }

  useEffect(() => setVisible(12), [categorySlug])

  const base = useMemo(() => {
    if (!category) return products
    if (category.slug === 'same-day') return products.filter((p) => p.sameDay)
    if (category.slug === 'new-arrivals') return products.filter((p) => p.newArrival)
    if (category.slug === 'best-sellers') return products.filter((p) => p.bestSeller)
    if (category.slug === 'birthday') return products.filter((p) => p.occasions.includes('birthday'))
    if (category.slug === 'anniversary') return products.filter((p) => p.occasions.includes('anniversary'))
    if (category.slug === 'wedding') return products.filter((p) => p.occasions.includes('wedding'))
    if (category.slug === 'corporate') return products.filter((p) => p.occasions.includes('corporate'))
    return products.filter((p) => p.category === category.slug)
  }, [products, category])

  const filtered = useMemo(() => applyFilters(base, filters), [base, filters])
  const chips = activeFilterChips(filters)
  const hasAnyFilter = chips.length > 0 || filters.sort !== 'relevance'

  const priceBounds = useMemo(() => {
    const prices = base.map((p) => p.price)
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 5000) }
  }, [base])

  const toggleArrayFilter = (key: 'subcats' | 'occasions' | 'colors', value: string) => {
    const arr = filters[key]
    setFilters({
      ...filters,
      [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
    })
  }

  const FilterPanel = (
    <div className="space-y-6">
      {/* categories */}
      <div>
        <p className="eyebrow mb-3 text-plum-400">Category</p>
        <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
          <Link to="/shop" className={`block rounded-lg px-2.5 py-1.5 text-sm ${!categorySlug ? 'bg-rose-50 font-bold text-rose-700' : 'text-plum-600 hover:bg-plum-50'}`}>
            All products
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className={`block rounded-lg px-2.5 py-1.5 text-sm ${categorySlug === c.slug ? 'bg-rose-50 font-bold text-rose-700' : 'text-plum-600 hover:bg-plum-50'}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        {/* dropdown for screens without dedicated page */}
        <label className="sr-only" htmlFor="cat-jump">Jump to category</label>
        <select
          id="cat-jump"
          className="input mt-3"
          value={categorySlug ?? ''}
          onChange={(e) => {
            const v = e.target.value
            if (v) window.location.assign(`/category/${v}`)
          }}
        >
          <option value="">Jump to category…</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* subcategories */}
      {category && category.subcategories.length > 0 && (
        <div>
          <p className="eyebrow mb-3 text-plum-400">Type</p>
          <div className="space-y-1.5">
            {category.subcategories.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-plum-600">
                <input
                  type="checkbox"
                  checked={filters.subcats.includes(s)}
                  onChange={() => toggleArrayFilter('subcats', s)}
                  className="h-4 w-4 rounded border-plum-300 accent-rose-600"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* price */}
      <div>
        <p className="eyebrow mb-3 text-plum-400">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`Min (${priceBounds.min})`}
            className="input"
            value={filters.priceMin ?? ''}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-plum-300">–</span>
          <input
            type="number"
            placeholder={`Max (${priceBounds.max})`}
            className="input"
            value={filters.priceMax ?? ''}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[[0, 500], [500, 1000], [1000, 2000], [2000, 99999]].map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => setFilters({ ...filters, priceMin: a, priceMax: b >= 99999 ? undefined : b })}
              className="chip text-[11px]"
            >
              {b >= 99999 ? `₹${a}+` : `₹${a}–₹${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* rating */}
      <div>
        <p className="eyebrow mb-3 text-plum-400">Rating</p>
        <div className="flex flex-wrap gap-1.5">
          {[4.5, 4, 3.5].map((r) => (
            <button key={r} onClick={() => setFilters({ ...filters, rating: filters.rating === r ? undefined : r })} className={`chip ${filters.rating === r ? 'chip-active' : ''}`}>
              {r}★ & up
            </button>
          ))}
        </div>
      </div>

      {/* occasions */}
      <div>
        <p className="eyebrow mb-3 text-plum-400">Occasion</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_OCCASIONS.map((o) => (
            <button key={o} onClick={() => toggleArrayFilter('occasions', o)} className={`chip text-[11px] capitalize ${filters.occasions.includes(o) ? 'chip-active' : ''}`}>
              {o.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* colors */}
      <div>
        <p className="eyebrow mb-3 text-plum-400">Colour</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_COLORS.map((c) => (
            <button key={c} onClick={() => toggleArrayFilter('colors', c)} className={`chip text-[11px] ${filters.colors.includes(c) ? 'chip-active' : ''}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* toggles */}
      <div className="space-y-2 border-t border-plum-100 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-plum-600">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-plum-300 accent-rose-600"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-plum-600">
          <input
            type="checkbox"
            checked={!!filters.sameDayOnly}
            onChange={(e) => setFilters({ ...filters, sameDayOnly: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-plum-300 accent-rose-600"
          />
          Same-day delivery
        </label>
      </div>

      {hasAnyFilter && (
        <button onClick={() => setFilters({ ...EMPTY_FILTERS })} className="btn-outline btn-sm w-full">
          Clear all filters
        </button>
      )}
    </div>
  )

  const sortSelect = (
    <div className="relative">
      <select
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
        className="input appearance-none pr-9 font-semibold"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-plum-400" />
    </div>
  )

  return (
    <CategoryEntrance kind={category?.animation ?? 'sparkle'} title={category ? `Welcome to ${category.name}` : 'The full collection'}>
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {/* heading */}
          <div className="mb-6">
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-plum-400" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-rose-600">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-rose-600">Shop</Link>
              {category && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-plum-600">{category.name}</span>
                </>
              )}
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="heading-lg text-plum-900">{category ? category.name : 'All Gifts'}</h1>
                <p className="mt-1 text-sm text-plum-500">
                  {category ? category.description : 'Every gift in the Velvette atelier, in one place.'}
                  {' '}· <strong className="text-plum-700">{filtered.length}</strong> {filtered.length === 1 ? 'gift' : 'gifts'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="btn-outline btn-sm lg:hidden"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal size={15} /> Filters
                </button>
                <div className="w-48">{sortSelect}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 card p-5">{FilterPanel}</div>
            </aside>

            <div>
              {/* chips */}
              {chips.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {chips.map((c, i) => (
                    <button key={i} onClick={() => setFilters(c.clear(filters))} className="chip chip-active">
                      {c.label} <X size={12} />
                    </button>
                  ))}
                  <button onClick={() => setFilters({ ...EMPTY_FILTERS })} className="text-xs font-bold text-rose-600 hover:underline">
                    Clear all
                  </button>
                </div>
              )}

              {/* grid */}
              {filtered.length === 0 ? (
                <EmptyState
                  title="No gifts match those filters"
                  subtitle="Try widening the price range, clearing a filter or two, or searching for something else entirely."
                  action={
                    <button onClick={() => setFilters({ ...EMPTY_FILTERS })} className="btn-primary btn-md">
                      Clear all filters
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.slice(0, visible).map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                  {visible < filtered.length && (
                    <div className="mt-8 text-center">
                      <button onClick={() => setVisible((v) => v + 12)} className="btn-dark btn-lg">
                        Load more ({filtered.length - visible} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </CategoryEntrance>
  )
}

export function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <SkeletonGrid count={8} />
    </div>
  )
}

/* eslint-disable */
