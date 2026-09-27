import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { useCatalog } from '../store/products'
import { useSearchHistory } from '../store/wishlist'
import { POPULAR_SEARCHES } from '../data/demo'
import ProductCard from '../components/ui/ProductCard'
import PageTransition from '../components/animations/PageTransition'
import { EmptyState } from '../components/ui/misc'
import { applyFilters, EMPTY_FILTERS } from '../lib/shop'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const products = useCatalog((s) => s.products)
  const { recent, push, clear } = useSearchHistory()

  const results = useMemo(() => {
    if (!q.trim()) return []
    push(q)
    return applyFilters(products, { ...EMPTY_FILTERS, q })
  }, [q, products]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <p className="eyebrow text-rose-600">Search</p>
        <h1 className="heading-lg mt-1 text-plum-900">
          {q ? <>Results for “{q}”</> : 'Search gifts'}
        </h1>
        <p className="mt-1 text-sm text-plum-500">
          {q ? `${results.length} matching gift${results.length === 1 ? '' : 's'}` : 'Type in the search bar above to explore the catalog.'}
        </p>

        {results.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={SearchX}
              title={q ? `Nothing found for “${q}”` : 'Start typing to search'}
              subtitle="Try “roses”, “cake”, “hamper”, “personalized” — or explore the categories below."
              action={
                <Link to="/shop" className="btn-primary btn-md">Browse all gifts</Link>
              }
            />
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4">
              <div className="text-center">
                <p className="eyebrow text-plum-400">Popular searches</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.map((s) => (
                    <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="chip">{s}</Link>
                  ))}
                </div>
              </div>
              {recent.length > 0 && (
                <div className="text-center">
                  <p className="eyebrow text-plum-400">Recent searches</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {recent.map((s) => (
                      <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="chip">{s}</Link>
                    ))}
                  </div>
                  <button onClick={clear} className="mt-2 text-xs font-bold text-rose-600 hover:underline">Clear recent searches</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
