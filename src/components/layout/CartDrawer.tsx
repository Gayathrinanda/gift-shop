import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useUi } from '../../store/ui'
import { useCart, computeTotals } from '../../store/cart'
import { useCatalog } from '../../store/products'
import SmartImage from '../ui/SmartImage'
import { money } from '../../lib/utils'

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUi()
  const { items, updateQty, removeItem } = useCart()
  const products = useCatalog((s) => s.products)
  const totals = computeTotals(useCart())

  const rows = items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId)
      if (!p) return null
      const v = p.variants.find((v) => v.id === i.variantId)
      return { item: i, product: p, variant: v, unit: p.price + (v?.priceDelta ?? 0) }
    })
    .filter(Boolean) as Array<{ item: typeof items[0]; product: typeof products[0]; variant?: { label: string }; unit: number }>

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[65] bg-plum-900/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[66] flex w-full max-w-md flex-col bg-cream shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-plum-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ShoppingBag size={18} className="text-rose-600" /> Your gift bag
              </h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="rounded-full p-2 hover:bg-plum-100">
                <X size={18} />
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <ShoppingBag size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-plum-900">Your gift bag is empty</p>
                  <p className="mt-1 text-sm text-plum-500">Fill it with something unforgettable.</p>
                </div>
                <Link to="/shop" onClick={() => setCartOpen(false)} className="btn-primary btn-md">
                  Explore gifts <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {rows.map(({ item, product, variant, unit }) => (
                    <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex gap-3 border-b border-plum-100 py-3 last:border-0">
                      <Link to={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
                        <SmartImage src={product.images[0]} alt={product.name} className="h-full w-full" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-semibold text-plum-900 hover:text-rose-700">
                            {product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            aria-label={`Remove ${product.name}`}
                            className="rounded-full p-1.5 text-plum-300 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {variant && <p className="text-xs text-plum-400">{variant.label}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-plum-200 bg-white px-1 py-0.5">
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                              className="rounded-full p-1 text-plum-600 hover:bg-plum-100 disabled:opacity-40"
                              disabled={item.qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                              className="rounded-full p-1 text-plum-600 hover:bg-plum-100"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-plum-900">{money(unit * item.qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-plum-100 bg-white px-5 py-4">
                  <div className="flex justify-between text-sm text-plum-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-plum-900">{money(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="mt-1 flex justify-between text-sm text-mint-deep">
                      <span>Coupon savings</span>
                      <span>−{money(totals.discount)}</span>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between text-sm text-plum-600">
                    <span>Delivery</span>
                    <span>{totals.delivery === 0 ? 'FREE' : money(totals.delivery)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-dashed border-plum-200 pt-2 text-base font-bold text-plum-900">
                    <span>Total</span>
                    <span>{money(totals.total)}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link to="/cart" onClick={() => setCartOpen(false)} className="btn-outline btn-md">
                      View cart
                    </Link>
                    <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-primary btn-md">
                      Checkout <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
