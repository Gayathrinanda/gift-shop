import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag } from 'lucide-react'
import type { Product } from '../../data/types'
import type { MouseEvent } from 'react'
import { useWishlist } from '../../store/wishlist'
import { useCart } from '../../store/cart'
import { toast, useUi } from '../../store/ui'
import { useAddToCartFeedback } from '../animations/AddToCartAnimation'
import { useWishlistFeedback } from '../animations/WishlistAnimation'
import SmartImage from './SmartImage'
import Rating from './Rating'
import { PriceTag } from './misc'
import { discountPct } from '../../lib/utils'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const wishlistIds = useWishlist((s) => s.ids)
  const toggleWishlist = useWishlist((s) => s.toggle)
  const addItem = useCart((s) => s.addItem)
  const setQuickView = useUi((s) => s.setQuickView)
  const onAddFeedback = useAddToCartFeedback()
  const onWishlistFeedback = useWishlistFeedback()
  const wished = wishlistIds.includes(product.id)
  const discount = discountPct(product.price, product.originalPrice)
  const hoverImage = product.images[1] ?? product.images[0]

  const handleAdd = (e: MouseEvent) => {
    if (product.stock === 0) return
    addItem({ productId: product.id, variantId: product.variants[0]?.id, qty: 1 })
    onAddFeedback(e, product.name)
  }

  const handleWishlist = (e: MouseEvent) => {
    toggleWishlist(product.id)
    onWishlistFeedback(e, !wished, product.name)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35 }}
      className="group card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {discount && <span className="badge bg-rose-600 text-white">{discount}% OFF</span>}
        {product.stock === 0 ? (
          <span className="badge bg-plum-800 text-white">Out of stock</span>
        ) : (
          <>
            {product.bestSeller && <span className="badge bg-gold text-white">Best Seller</span>}
            {product.newArrival && <span className="badge bg-mint-deep text-white">New</span>}
          </>
        )}
      </div>

      {/* wishlist */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleWishlist}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-soft backdrop-blur transition hover:scale-110"
      >
        <motion.span
          key={String(wished)}
          initial={{ scale: wished ? 0.4 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="block"
        >
          <Heart size={17} className={wished ? 'fill-rose-600 text-rose-600' : 'text-plum-500'} />
        </motion.span>
      </motion.button>

      {/* image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3.4] overflow-hidden bg-plum-50">
        <SmartImage src={product.images[0]} alt={product.name} className="h-full w-full" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <SmartImage src={hoverImage} alt="" className="h-full w-full" />
        </div>
        {/* quick view */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setQuickView(product)
          }}
          className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-plum-800 opacity-0 shadow-lift backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={14} /> Quick view
        </button>
      </Link>

      {/* content */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-plum-900 transition group-hover:text-rose-700">
          {product.name}
        </Link>
        <div className="mt-1.5">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <PriceTag price={product.price} original={product.originalPrice} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="rounded-full bg-plum-800 p-2.5 text-cream shadow-soft transition hover:bg-rose-600 disabled:opacity-40"
          >
            <ShoppingBag size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
