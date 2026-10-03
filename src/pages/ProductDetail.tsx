import { useMemo, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, ShoppingBag, Truck, ShieldCheck, MapPin, Check, Minus, Plus,
  RotateCcw, BadgeCheck, ChevronRight, MessageSquare, Star,
} from 'lucide-react'
import { useCatalog } from '../store/products'
import { useCart } from '../store/cart'
import { useWishlist, useRecentlyViewed } from '../store/wishlist'
import { useReviews } from '../store/merch'
import { toast } from '../store/ui'
import ProductImageGallery from '../components/ui/ProductImageGallery'
import ProductRow from '../components/ui/ProductRow'
import Rating, { Stars } from '../components/ui/Rating'
import { EmptyState, PriceTag } from '../components/ui/misc'
import SmartImage from '../components/ui/SmartImage'
import PageTransition from '../components/animations/PageTransition'
import { useAddToCartFeedback } from '../components/animations/AddToCartAnimation'
import { useWishlistFeedback } from '../components/animations/WishlistAnimation'
import { CATEGORY_MAP } from '../data/categories'
import { categoryLink } from '../store/categoryStatus'
import { money, formatDate, discountPct, isValidPincode } from '../lib/utils'

const TABS = ['Description', 'Highlights', 'Delivery & Care'] as const

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const products = useCatalog((s) => s.products)
  const product = products.find((p) => p.slug === productId || p.id === productId)

  const addItem = useCart((s) => s.addItem)
  const wishlistIds = useWishlist((s) => s.ids)
  const toggleWishlist = useWishlist((s) => s.toggle)
  const pushRecent = useRecentlyViewed((s) => s.push)
  const reviews = useReviews((s) => s.reviews)
  const addReview = useReviews((s) => s.add)

  const [variantId, setVariantId] = useState<string | undefined>(undefined)
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [pincode, setPincode] = useState('')
  const [pinResult, setPinResult] = useState<null | { ok: boolean; msg: string }>(null)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Description')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, text: '', name: '' })

  const onAddFeedback = useAddToCartFeedback()
  const onWishlistFeedback = useWishlistFeedback()

  useEffect(() => {
    if (product) {
      pushRecent(product.id)
      setVariantId(product.variants[0]?.id)
      setQty(1)
      setPinResult(null)
      window.scrollTo({ top: 0 })
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(
    () => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 8),
    [products, product?.id],
  )
  const recent = useMemo(
    () => useRecentlyViewed.getState().ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p && p.id !== product?.id)
      .slice(0, 8),
    [products, product?.id],
  )
  const productReviews = reviews.filter((r) => r.productId === product?.id && r.approved)

  if (!product) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <EmptyState
            icon={Star}
            title="This gift has wandered off"
            subtitle="The product you are looking for is not in our demo catalog. It may have been removed from the admin console."
            action={<Link to="/shop" className="btn-primary btn-md">Browse all gifts</Link>}
          />
        </div>
      </PageTransition>
    )
  }

  const wished = wishlistIds.includes(product.id)
  const variant = product.variants.find((v) => v.id === variantId)
  const unitPrice = product.price + (variant?.priceDelta ?? 0)
  const originalWithVariant = product.originalPrice ? product.originalPrice + (variant?.priceDelta ?? 0) : undefined
  const cat = CATEGORY_MAP[product.category]

  const handleAdd = (e: React.MouseEvent) => {
    addItem({ productId: product.id, variantId, qty, giftNote: note || undefined })
    onAddFeedback(e, product.name)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    addItem({ productId: product.id, variantId, qty, giftNote: note || undefined })
    navigate('/checkout')
  }

  const handleWishlist = (e: React.MouseEvent) => {
    toggleWishlist(product.id)
    onWishlistFeedback(e, !wished, product.name)
  }

  const checkPin = () => {
    if (!isValidPincode(pincode)) {
      setPinResult({ ok: false, msg: 'Enter a valid 6-digit Indian pincode (demo).' })
      return
    }
    const metro = /^(400|110|560|600|700|500|411|380)/.test(pincode)
    setPinResult({
      ok: true,
      msg: metro
        ? 'Good news! Same-day delivery available here (demo).'
        : 'Deliverable in 2–4 days to this pincode (demo).',
    })
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-6">
        {/* breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-plum-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-rose-600">Home</Link>
          <ChevronRight size={12} />
          <Link to={categoryLink(product.category)} className="hover:text-rose-600">{cat?.name}</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-plum-600">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery images={product.images} name={product.name} />
          </div>

          <div>
            {/* badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              {product.bestSeller && <span className="badge bg-gold text-white">Best Seller</span>}
              {product.newArrival && <span className="badge bg-mint-deep text-white">New Arrival</span>}
              {product.sameDay && <span className="badge bg-rose-50 text-rose-700">Same-day available</span>}
              {product.stock === 0 && <span className="badge bg-plum-800 text-white">Out of stock</span>}
            </div>
            <h1 className="heading-lg text-plum-900">{product.name}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} size={16} />
              <span className="text-plum-200">|</span>
              <span className="text-xs font-semibold text-mint-deep">{product.reviewCount} gifts delivered happily</span>
            </div>

            <div className="mt-4">
              <PriceTag price={unitPrice} original={originalWithVariant} size="lg" />
              <p className="mt-1 text-xs text-plum-400">Inclusive of all taxes · Demo pricing</p>
            </div>

            {/* variants */}
            {product.variants.length > 0 && (
              <div className="mt-5">
                <p className="label">Size / option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`chip px-4 py-2 text-sm ${variantId === v.id ? 'chip-active' : ''}`}
                    >
                      {v.label}
                      {v.priceDelta !== 0 && (
                        <span className="opacity-75">{v.priceDelta > 0 ? ` +${money(v.priceDelta)}` : ` −${money(Math.abs(v.priceDelta))}`}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* qty + stock */}
            <div className="mt-5 flex items-center gap-4">
              <div>
                <p className="label">Quantity</p>
                <div className="flex items-center rounded-full border border-plum-200 bg-white">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-plum-600 hover:text-rose-600 disabled:opacity-40" disabled={qty <= 1} aria-label="Decrease quantity">
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="p-2.5 text-plum-600 hover:text-rose-600" aria-label="Increase quantity">
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              {product.stock > 0 && product.stock <= 12 && (
                <p className="mt-6 text-xs font-semibold text-rose-600">Only {product.stock} left — order soon</p>
              )}
              {product.stock === 0 && <p className="mt-6 text-xs font-semibold text-plum-400">Currently out of stock</p>}
            </div>

            {/* pincode */}
            <div className="mt-5 rounded-2xl border border-plum-100 bg-white p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-800">
                <MapPin size={15} className="text-rose-600" /> Delivery check
              </p>
              <div className="flex gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter pincode e.g. 400001"
                  className="input flex-1"
                  inputMode="numeric"
                  aria-label="Delivery pincode"
                />
                <button onClick={checkPin} className="btn-dark btn-md flex-shrink-0">Check</button>
              </div>
              {pinResult && (
                <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${pinResult.ok ? 'text-mint-deep' : 'text-rose-600'}`}>
                  {pinResult.ok ? <Check size={13} /> : <MapPin size={13} />} {pinResult.msg}
                </p>
              )}
            </div>

            {/* gift note */}
            <div className="mt-4 rounded-2xl border border-plum-100 bg-white p-4">
              <p className="mb-2 text-sm font-bold text-plum-800">Add a gift note (free)</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                placeholder="“Happy birthday Ayesha — hope this year is your best one yet.”"
                rows={2}
                className="input resize-none"
                aria-label="Gift note"
              />
              <p className="mt-1 text-right text-[11px] text-plum-300">{note.length}/200</p>
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="btn-primary btn-lg flex-1 min-w-[180px]"
              >
                <ShoppingBag size={18} /> {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-dark btn-lg flex-1 min-w-[150px]"
              >
                Buy Now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                className="btn-outline btn-lg px-4"
              >
                <Heart size={19} className={wished ? 'fill-rose-600 text-rose-600' : ''} />
              </motion.button>
            </div>

            {/* trust points */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 text-center shadow-soft">
              {[
                { icon: Truck, t: 'Same-day option' },
                { icon: ShieldCheck, t: 'Freshness promise' },
                { icon: RotateCcw, t: 'Easy replacements' },
              ].map((x) => (
                <div key={x.t} className="flex flex-col items-center gap-1.5">
                  <x.icon size={18} className="text-rose-600" />
                  <span className="text-[11px] font-semibold text-plum-600">{x.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-14">
          <div className="flex gap-1 border-b border-plum-100" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`relative px-5 py-3 text-sm font-bold transition ${tab === t ? 'text-rose-700' : 'text-plum-400 hover:text-plum-700'}`}
              >
                {t}
                {tab === t && <motion.span layoutId="tab-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-rose-600" />}
              </button>
            ))}
          </div>
          <div className="py-6 text-sm leading-relaxed text-plum-600">
            {tab === 'Description' && <p className="max-w-3xl">{product.description}</p>}
            {tab === 'Highlights' && (
              <ul className="grid max-w-3xl gap-2.5 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <BadgeCheck size={16} className="mt-0.5 flex-shrink-0 text-mint-deep" /> {h}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'Delivery & Care' && (
              <div className="max-w-3xl space-y-3">
                <p><strong>Delivery:</strong> Same-day before 6 PM in serviceable metros; standard 2–4 days elsewhere (demo).</p>
                <p><strong>Care:</strong> Trim stems 1 inch at 45°, change water daily, keep away from direct sunlight and ripening fruit.</p>
                <p><strong>Note:</strong> Occasionally we substitute seasonal blooms of equal or greater value to protect freshness.</p>
              </div>
            )}
          </div>
        </div>

        {/* reviews */}
        <div className="mt-8 grid gap-8 rounded-3xl bg-white p-6 shadow-soft md:grid-cols-[280px_1fr] md:p-8">
          <div>
            <h2 className="heading-md text-plum-900">Reviews</h2>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-5xl font-bold text-plum-900">{product.rating.toFixed(1)}</span>
              <div className="pb-1.5">
                <Stars value={product.rating} size={16} />
                <p className="mt-1 text-xs text-plum-400">{product.reviewCount} verified demo reviews</p>
              </div>
            </div>
            <button onClick={() => setShowReviewForm((v) => !v)} className="btn-outline btn-md mt-5 w-full">
              <MessageSquare size={15} /> Write a review
            </button>
            {showReviewForm && (
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (reviewDraft.text.trim().length < 10) {
                    toast.error('Review too short', 'Tell us a little more (10+ characters).')
                    return
                  }
                  addReview({
                    productId: product.id,
                    customerName: reviewDraft.name.trim() || 'Anonymous gifter',
                    rating: reviewDraft.rating,
                    text: reviewDraft.text.trim(),
                    approved: true,
                  })
                  toast.success('Review submitted', 'Thanks for the kind words (demo)!')
                  setReviewDraft({ rating: 5, text: '', name: '' })
                  setShowReviewForm(false)
                }}
              >
                <div>
                  <p className="label">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewDraft((d) => ({ ...d, rating: n }))} aria-label={`${n} star`}>
                        <Star size={22} className={n <= reviewDraft.rating ? 'fill-gold text-gold' : 'fill-plum-100 text-plum-100'} />
                      </button>
                    ))}
                  </div>
                </div>
                <input className="input" placeholder="Your name (optional)" value={reviewDraft.name} onChange={(e) => setReviewDraft((d) => ({ ...d, name: e.target.value }))} />
                <textarea className="input" rows={3} placeholder="What made it special?" value={reviewDraft.text} onChange={(e) => setReviewDraft((d) => ({ ...d, text: e.target.value }))} />
                <button type="submit" className="btn-primary btn-md w-full">Submit review</button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            {productReviews.length === 0 && (
              <p className="rounded-2xl bg-plum-50 p-6 text-center text-sm text-plum-400">
                No written reviews yet for this gift — yours could be the first.
              </p>
            )}
            {productReviews.map((r) => (
              <article key={r.id} className="rounded-2xl border border-plum-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600">
                      {r.customerName[0]}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-plum-900">{r.customerName}</p>
                      <Stars value={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-plum-300">{formatDate(r.date)}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-plum-600">{r.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="heading-md mb-6 text-plum-900">You may also love</h2>
            <ProductRow products={related} />
          </section>
        )}

        {/* recently viewed */}
        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="heading-md mb-6 text-plum-900">Recently viewed</h2>
            <ProductRow products={recent} />
          </section>
        )}
      </div>
    </PageTransition>
  )
}
