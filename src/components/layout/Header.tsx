import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Search, ShoppingBag, User, Menu, X, MapPin, ChevronDown, Flower2, Cake, Gift, Sparkles, Leaf, Star } from 'lucide-react'
import { CATEGORIES } from '../../data/categories'
import { useCart, cartCount } from '../../store/cart'
import { useWishlist } from '../../store/wishlist'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'
import SearchOverlay from './SearchOverlay'
import CartDrawer from './CartDrawer'
import { useMotionSafe } from '../../lib/motion'

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Velvette home">
      <motion.span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 font-display text-lg font-bold text-white shadow-soft"
        whileHover={{ rotate: -8, scale: 1.05 }}
      >
        V
      </motion.span>
      <span className="font-display text-[22px] font-bold tracking-tight text-plum-900">
        Velvette
        {!compact && <span className="ml-1.5 hidden text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-gold lg:inline">Gifting</span>}
      </span>
    </Link>
  )
}

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/category/new-arrivals', label: 'New' },
  { to: '/category/best-sellers', label: 'Best Sellers' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartItems = useCart((s) => s.items)
  const wishlistCount = useWishlist((s) => s.ids.length)
  const user = useAuth((s) => s.user)
  const setCartOpen = useUi((s) => s.setCartOpen)
  const setSearchOpen = useUi((s) => s.setSearchOpen)
  const motionSafe = useMotionSafe()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const count = cartCount(cartItems)

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? 'border-plum-100 bg-cream/90 shadow-soft backdrop-blur-xl' : 'border-transparent bg-cream'
        }`}
      >
        {/* announcement bar */}
        <div className="hidden bg-plum-800 text-cream md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[11px]">
            <p className="tracking-wide">
              <Sparkles size={12} className="mr-1.5 inline text-gold-light" />
              Free delivery on orders over ₹999 · Demo store — no real payments
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-cream/80">
                <MapPin size={11} /> Delivering across India
              </span>
              <Link to="/admin/login" className="font-semibold text-gold-light transition hover:text-white">
                Admin
              </Link>
              <Link to="/category/same-day" className="font-semibold text-gold-light transition hover:text-white">
                Same-Day Delivery
              </Link>
            </div>
          </div>
          <div className="sr-only">Demo store announcement bar</div>
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-plum-700 transition hover:bg-plum-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <Logo />
          </div>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-plum-100 text-plum-900' : 'text-plum-600 hover:bg-plum-100/70 hover:text-plum-900'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
              <button
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition ${megaOpen ? 'bg-plum-100 text-plum-900' : 'text-plum-600 hover:bg-plum-100/70 hover:text-plum-900'}`}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Categories <ChevronDown size={15} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 top-full z-50 w-[680px] -translate-x-1/2 pt-3"
                  >
                    <div className="grid grid-cols-3 gap-1 rounded-3xl border border-plum-100 bg-white p-4 shadow-lift">
                      {CATEGORIES.slice(0, 12).map((c) => (
                        <Link
                          key={c.slug}
                          to={`/category/${c.slug}`}
                          className="group flex items-start gap-3 rounded-2xl p-2.5 transition hover:bg-rose-50"
                          onClick={() => setMegaOpen(false)}
                        >
                          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white">
                            <CategoryIcon slug={c.slug} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-plum-900 group-hover:text-rose-700">{c.name}</span>
                            <span className="block text-[11px] leading-tight text-plum-400">{c.tagline}</span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        to="/shop"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-plum-800 p-3 text-sm font-bold text-cream transition hover:bg-plum-900"
                        onClick={() => setMegaOpen(false)}
                      >
                        Browse everything <ArrowRightSmall />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* actions */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search gifts"
              className="rounded-full p-2.5 text-plum-700 transition hover:bg-plum-100"
            >
              <Search size={20} />
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2.5 text-plum-700 transition hover:bg-plum-100">
              <Heart size={20} />
              {wishlistCount > 0 && <CountBubble n={wishlistCount} tone="gold" />}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative rounded-full p-2.5 text-plum-700 transition hover:bg-plum-100"
            >
              <ShoppingBag size={20} />
              {count > 0 && <CountBubble n={count} tone="rose" />}
            </button>
            <div className="ml-1 hidden items-center gap-2 md:flex">
              {user ? (
                <Link to="/account" className="btn-dark btn-sm gap-2">
                  <User size={15} /> {user.name.split(' ')[0]}
                </Link>
              ) : (
                <Link to="/signin" className="btn-outline btn-sm">
                  Sign in
                </Link>
              )}
              <Link to="/shop" className="btn-primary btn-sm hidden xl:inline-flex">
                Send a Gift
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-plum-900/40 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[61] flex w-[320px] flex-col bg-cream shadow-lift lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-plum-100 p-4">
                <Logo compact />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-plum-100">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
                <div className="space-y-1">
                  {NAV_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-plum-800 transition hover:bg-plum-100">
                      {l.label}
                    </Link>
                  ))}
                </div>
                <p className="eyebrow mt-6 mb-2 px-4 text-plum-400">Categories</p>
                <div className="space-y-1">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-plum-700 transition hover:bg-rose-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <CategoryIcon slug={c.slug} />
                      </span>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </nav>
              <div className="border-t border-plum-100 p-4">
                {user ? (
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="btn-dark btn-md w-full">
                    <User size={16} /> My Account
                  </Link>
                ) : (
                  <Link to="/signin" onClick={() => setMobileOpen(false)} className="btn-primary btn-md w-full">
                    Sign in / Register
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay />
      <CartDrawer />
    </>
  )
}

function CountBubble({ n, tone }: { n: number; tone: 'rose' | 'gold' }) {
  return (
    <motion.span
      key={n}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
      className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
        tone === 'rose' ? 'bg-rose-600' : 'bg-gold'
      }`}
    >
      {n > 9 ? '9+' : n}
    </motion.span>
  )
}

function ArrowRightSmall() {
  return <span aria-hidden>→</span>
}

export function CategoryIcon({ slug }: { slug: string }) {
  const map: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
    flowers: Flower2,
    bouquets: Flower2,
    cakes: Cake,
    birthday: Cake,
    chocolates: Gift,
    hampers: Gift,
    gifts: Gift,
    plants: Leaf,
    personalized: Sparkles,
    'new-arrivals': Sparkles,
    anniversary: Heart,
    wedding: Sparkles,
    corporate: Star,
    'same-day': Star,
    'best-sellers': Star,
    combos: Gift,
  }
  const Icon = map[slug] ?? Gift
  return <Icon size={16} />
}
