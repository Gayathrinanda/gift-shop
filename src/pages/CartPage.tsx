import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, TicketPercent, Heart, X, BookmarkPlus } from 'lucide-react'
import { useCart, computeTotals } from '../store/cart'
import { useCatalog } from '../store/products'
import SmartImage from '../components/ui/SmartImage'
import PageTransition from '../components/animations/PageTransition'
import { EmptyState } from '../components/ui/misc'
import { money } from '../lib/utils'
import { toast } from '../store/ui'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, savedForLater, updateQty, removeItem, applyCoupon, removeCoupon, coupon, saveForLater, moveToCart, setGiftNote } = useCart()
  const products = useCatalog((s) => s.products)
  const totals = computeTotals(useCart())
  const [code, setCode] = useState('')
  const [showCoupons, setShowCoupons] = useState(false)
  const [noteFor, setNoteFor] = useState<string | null>(null)

  const rows = items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId)
      if (!p) return null
      const v = p.variants.find((v) => v.id === i.variantId)
      return { item: i, product: p, variant: v, unit: p.price + (v?.priceDelta ?? 0) }
    })
    .filter(Boolean) as Array<{ item: (typeof items)[0]; product: (typeof products)[0]; variant?: { id: string; label: string }; unit: number }>

  const savedRows = savedForLater
    .map((i) => ({ item: i, product: products.find((x) => x.id === i.productId)! }))
    .filter((r) => r.product)

  const handleApply = () => {
    const res = applyCoupon(code)
    if (res.ok) toast.success('Coupon applied', res.message)
    else toast.error('Coupon failed', res.message)
  }

  if (rows.length === 0 && savedRows.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            subtitle="Every great celebration starts with something small in a gift bag."
            action={
              <Link to="/shop" className="btn-primary btn-lg">
                Explore gifts <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 className="heading-lg text-plum-900">Your Gift Bag</h1>
        <p className="mt-1 text-sm text-plum-500">{rows.length} item{rows.length === 1 ? '' : 's'} · demo checkout, no real payments</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            {/* items */}
            <div className="space-y-4">
              {rows.map(({ item, product, variant, unit }) => (
                <article key={`${item.productId}-${item.variantId ?? ''}`} className="card flex gap-4 p-4">
                  <Link to={`/product/${product.slug}`} className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                    <SmartImage src={product.images[0]} alt={product.name} className="h-full w-full" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${product.slug}`} className="font-semibold text-plum-900 hover:text-rose-700">
                          {product.name}
                        </Link>
                        {variant && <p className="mt-0.5 text-xs text-plum-400">{variant.label}</p>}
                        {product.stock === 0 ? (
                          <p className="mt-1 text-xs font-bold text-rose-600">Out of stock — remove to checkout</p>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-mint-deep">
                            {product.sameDay ? 'Same-day delivery available' : 'Standard delivery'}
                          </p>
                        )}
                      </div>
                      <p className="text-right">
                        <span className="block text-lg font-bold text-plum-900">{money(unit * item.qty)}</span>
                        {item.qty > 1 && <span className="text-xs text-plum-400">{money(unit)} each</span>}
                      </p>
                    </div>

                    {item.giftNote && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-1.5 text-xs italic text-rose-700">“{item.giftNote}”</p>}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-full border border-plum-200 bg-white">
                        <button onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)} disabled={item.qty <= 1} className="p-2 text-plum-600 hover:text-rose-600 disabled:opacity-40" aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)} className="p-2 text-plum-600 hover:text-rose-600" aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => setNoteFor(noteFor === item.productId ? null : item.productId)} className="chip text-[11px]">
                        <Heart size={12} /> Note
                      </button>
                      <button onClick={() => { saveForLater(item.productId, item.variantId); toast.info('Saved for later') }} className="chip text-[11px]">
                        <BookmarkPlus size={12} /> Save for later
                      </button>
                      <button
                        onClick={() => { removeItem(item.productId, item.variantId); toast.info('Removed from cart', product.name) }}
                        className="ml-auto rounded-full p-2 text-plum-300 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {noteFor === item.productId && (
                      <div className="mt-2 flex gap-2">
                        <input
                          className="input flex-1"
                          placeholder="Add a gift note…"
                          defaultValue={item.giftNote ?? ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setGiftNote(item.productId, (e.target as HTMLInputElement).value)
                              setNoteFor(null)
                              toast.success('Gift note saved')
                            }
                          }}
                          autoFocus
                        />
                        <button onClick={() => setNoteFor(null)} className="btn-ghost btn-sm">Done</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* saved for later */}
            {savedRows.length > 0 && (
              <section className="mt-10">
                <h2 className="heading-md text-plum-900">Saved for later</h2>
                <div className="mt-4 space-y-3">
                  {savedRows.map(({ item, product }) => (
                    <div key={item.productId} className="card flex items-center gap-3 p-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                        <SmartImage src={product.images[0]} alt={product.name} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-plum-900">{product.name}</p>
                        <p className="text-xs text-plum-400">{money(product.price)}</p>
                      </div>
                      <button onClick={() => { moveToCart(item.productId); toast.success('Moved to cart', product.name) }} className="btn-outline btn-sm">
                        Move to cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-plum-900">Order summary</h2>

              {/* coupon */}
              <div className="mt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-2xl border border-mint/40 bg-mint/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TicketPercent size={17} className="text-mint-deep" />
                      <div>
                        <p className="text-sm font-bold text-mint-deep">{coupon.code}</p>
                        <p className="text-[11px] text-plum-500">Demo coupon applied</p>
                      </div>
                    </div>
                    <button onClick={() => { removeCoupon(); toast.info('Coupon removed') }} aria-label="Remove coupon" className="rounded-full p-1.5 text-plum-400 hover:bg-white">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="input flex-1 uppercase"
                        aria-label="Coupon code"
                      />
                      <button onClick={handleApply} className="btn-dark btn-md flex-shrink-0">
                        <Tag size={14} /> Apply
                      </button>
                    </div>
                    <button onClick={() => setShowCoupons((v) => !v)} className="mt-2 text-xs font-bold text-rose-600 hover:underline">
                      {showCoupons ? 'Hide' : 'View available demo coupons'}
                    </button>
                    {showCoupons && (
                      <div className="mt-2 space-y-2">
                        {['WELCOME10', 'GIFT20', 'FIRSTORDER'].map((c) => (
                          <button
                            key={c}
                            onClick={() => { setCode(c); handleApply() }}
                            className="flex w-full items-center justify-between rounded-xl border border-dashed border-plum-200 bg-plum-50/50 px-3 py-2 text-left transition hover:border-rose-400"
                          >
                            <span className="text-sm font-bold text-plum-800">{c}</span>
                            <span className="text-[11px] text-plum-400">Tap to apply</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <dl className="mt-5 space-y-2.5 border-t border-dashed border-plum-200 pt-4 text-sm">
                <div className="flex justify-between text-plum-600">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-plum-900">{money(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-mint-deep">
                    <dt>Coupon discount</dt>
                    <dd>−{money(totals.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-plum-600">
                  <dt>Delivery</dt>
                  <dd className={totals.delivery === 0 ? 'font-semibold text-mint-deep' : 'font-semibold text-plum-900'}>
                    {totals.delivery === 0 ? 'FREE' : money(totals.delivery)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-plum-100 pt-3 text-lg font-bold text-plum-900">
                  <dt>Total</dt>
                  <dd>{money(totals.total)}</dd>
                </div>
              </dl>

              {totals.delivery > 0 && (
                <p className="mt-3 rounded-xl bg-gold/10 px-3 py-2 text-[11px] font-semibold text-gold-deep">
                  Add {money(999 - totals.subtotal)} more for free standard delivery
                </p>
              )}

              <button
                onClick={() => navigate('/checkout')}
                disabled={rows.every((r) => r.product.stock === 0)}
                className="btn-primary btn-lg mt-5 w-full"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <Link to="/shop" className="btn-ghost btn-md mt-2 w-full">Continue shopping</Link>
              <p className="mt-3 text-center text-[11px] text-plum-300">Demo store — coupons, totals & payments are simulated.</p>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}
