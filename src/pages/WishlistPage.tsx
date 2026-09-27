import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useWishlist } from '../store/wishlist'
import { useCatalog } from '../store/products'
import { useCart } from '../store/cart'
import ProductCard from '../components/ui/ProductCard'
import PageTransition from '../components/animations/PageTransition'
import { EmptyState } from '../components/ui/misc'
import { toast } from '../store/ui'

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids)
  const remove = useWishlist((s) => s.remove)
  const clear = useWishlist((s) => s.clear)
  const products = useCatalog((s) => s.products)
  const addItem = useCart((s) => s.addItem)

  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Array<(typeof products)[0]>

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="heading-lg flex items-center gap-3 text-plum-900">
              <Heart className="fill-rose-600 text-rose-600" /> Wishlist
            </h1>
            <p className="mt-1 text-sm text-plum-500">{items.length} saved gift{items.length === 1 ? '' : 's'} · synced to this browser (demo)</p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  items.filter((p) => p.stock > 0).forEach((p) => addItem({ productId: p.id, variantId: p.variants[0]?.id, qty: 1 }))
                  toast.success('Wishlist moved to cart', `${items.filter((p) => p.stock > 0).length} in-stock items added.`)
                }}
                className="btn-primary btn-md"
              >
                <ShoppingBag size={15} /> Add all to cart
              </button>
              <button onClick={() => { clear(); toast.info('Wishlist cleared') }} className="btn-outline btn-md">
                <Trash2 size={15} /> Clear
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nothing saved yet"
              subtitle="Tap the heart on any gift to keep it here for later — it survives page refreshes."
              action={<Link to="/shop" className="btn-primary btn-lg">Discover gifts <ArrowRight size={16} /></Link>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
