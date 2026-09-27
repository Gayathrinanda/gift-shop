import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, TrendingUp, Clock, X, ArrowRight } from 'lucide-react'
import { useUi } from '../../store/ui'
import { useCatalog } from '../../store/products'
import { useSearchHistory } from '../../store/wishlist'
import { POPULAR_SEARCHES } from '../../data/demo'
import SmartImage from '../ui/SmartImage'
import { money } from '../../lib/utils'
import { CATEGORY_MAP } from '../../data/categories'

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUi()
  const products = useCatalog((s) => s.products)
  const { recent, push, clear } = useSearchHistory()
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchOpen])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [setSearchOpen])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return products
      .filter((p) => {
        const cat = CATEGORY_MAP[p.category]?.name ?? ''
        return (
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          cat.toLowerCase().includes(term) ||
          p.occasions.some((o) => o.toLowerCase().includes(term)) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
        )
      })
      .slice(0, 6)
  }, [q, products])

  const go = (term?: string) => {
    if (term) push(term)
    setSearchOpen(false)
    navigate(`/search?q=${encodeURIComponent(term ?? q)}`)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[75]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-plum-900/45 backdrop-blur-[3px]" onClick={() => setSearchOpen(false)} />
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-x-0 top-0 mx-auto max-w-3xl p-4 md:pt-10"
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift">
              <form
                className="flex items-center gap-3 border-b border-plum-100 px-5 py-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (q.trim()) go()
                }}
              >
                <Search size={20} className="text-plum-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search red roses, birthday cakes, hampers…"
                  className="flex-1 bg-transparent text-base text-plum-900 outline-none placeholder:text-plum-300"
                  aria-label="Search products"
                />
                {q && (
                  <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="rounded-full p-1 text-plum-300 hover:bg-plum-100">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="btn-primary btn-sm hidden md:inline-flex">
                  Search
                </button>
              </form>

              <div className="max-h-[60vh] overflow-y-auto p-5">
                {/* results */}
                {q.trim() && (
                  <div className="mb-5">
                    <p className="eyebrow mb-2 text-plum-400">{results.length ? 'Products' : 'No matches — try “roses”, “cake”, “hamper”'}</p>
                    {results.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSearchOpen(false)
                          navigate(`/product/${p.slug}`)
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-rose-50"
                      >
                        <SmartImage src={p.images[0]} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-plum-900">{p.name}</span>
                          <span className="block text-xs text-plum-400">{CATEGORY_MAP[p.category]?.name}</span>
                        </span>
                        <span className="text-sm font-bold text-plum-800">{money(p.price)}</span>
                      </button>
                    ))}
                    {results.length > 0 && (
                      <button onClick={() => go()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-plum-800 py-2.5 text-sm font-bold text-cream transition hover:bg-plum-900">
                        See all results for “{q.trim()}” <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-2 flex items-center gap-1.5 text-plum-400">
                      <TrendingUp size={13} /> Popular searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((s) => (
                        <button key={s} onClick={() => go(s)} className="chip">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {recent.length > 0 && (
                    <div>
                      <p className="eyebrow mb-2 flex items-center gap-1.5 text-plum-400">
                        <Clock size={13} /> Recent searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((s) => (
                          <button key={s} onClick={() => go(s)} className="chip">
                            {s}
                          </button>
                        ))}
                      </div>
                      <button onClick={clear} className="mt-3 text-xs font-semibold text-rose-600 hover:underline">
                        Clear recent searches
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
