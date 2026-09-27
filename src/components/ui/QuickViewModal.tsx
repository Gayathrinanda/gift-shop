import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, ArrowRight } from 'lucide-react'
import type { Product } from '../../data/types'
import Modal from './Modal'
import SmartImage from './SmartImage'
import Rating from './Rating'
import { PriceTag } from './misc'
import { useWishlist } from '../../store/wishlist'
import { useCart } from '../../store/cart'
import { useAddToCartFeedback } from '../animations/AddToCartAnimation'
import { useWishlistFeedback } from '../animations/WishlistAnimation'
import { discountPct } from '../../lib/utils'
import { useState } from 'react'
import { useUi } from '../../store/ui'

export default function QuickViewModal() {
  const { quickView, closeQuickView } = useUi()
  const product = quickView?.product
  const [imgIdx, setImgIdx] = useState(0)
  const [variantId, setVariantId] = useState<string | undefined>(undefined)

  const wishlistIds = useWishlist((s) => s.ids)
  const toggleWishlist = useWishlist((s) => s.toggle)
  const addItem = useCart((s) => s.addItem)
  const onAddFeedback = useAddToCartFeedback()
  const onWishlistFeedback = useWishlistFeedback()

  // reset selection per open
  const [forId, setForId] = useState<string | null>(null)
  if (product && forId !== product.id) {
    setForId(product.id)
    setImgIdx(0)
    setVariantId(product?.variants[0]?.id)
  }

  const wished = product ? wishlistIds.includes(product.id) : false

  const handleAdd = (e: React.MouseEvent) => {
    if (!product) return
    addItem({ productId: product.id, variantId: variantId ?? product.variants[0]?.id, qty: 1 })
    onAddFeedback(e, product.name)
    closeQuickView()
  }

  const handleWishlist = (e: React.MouseEvent) => {
    if (!product) return
    toggleWishlist(product.id)
    onWishlistFeedback(e, !wished, product.name)
  }

  return (
    <Modal open={!!product} onClose={closeQuickView} title="Quick view" wide>
      {product && (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-plum-50">
              <SmartImage src={product.images[imgIdx]} alt={product.name} className="h-full w-full" />
              {discountPct(product.price, product.originalPrice) && (
                <span className="badge absolute left-3 top-3 bg-rose-600 text-white">
                  {discountPct(product.price, product.originalPrice)}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${i === imgIdx ? 'border-rose-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <SmartImage src={img} alt="" className="h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-semibold text-plum-900">{product.name}</h3>
            <div className="mt-2">
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
            <div className="mt-3">
              <PriceTag price={product.price} original={product.originalPrice} size="lg" />
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-plum-500">{product.description}</p>
            {product.variants.length > 0 && (
              <div className="mt-4">
                <p className="label">Size / option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`chip ${variantId === v.id ? 'chip-active' : ''}`}
                    >
                      {v.label}
                      {v.priceDelta !== 0 && <span className="opacity-70"> {v.priceDelta > 0 ? `+₹${v.priceDelta}` : `−₹${Math.abs(v.priceDelta)}`}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={product.stock === 0} className="btn-primary btn-md">
                <ShoppingBag size={16} /> {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
              </motion.button>
              <button onClick={handleWishlist} className="btn-outline btn-md" aria-label="Toggle wishlist">
                <Heart size={16} className={wished ? 'fill-rose-600 text-rose-600' : ''} /> {wished ? 'Wishlisted' : 'Wishlist'}
              </button>
              <Link to={`/product/${product.slug}`} onClick={closeQuickView} className="btn-ghost btn-md text-sm">
                Full details <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
