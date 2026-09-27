import { useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  User, Package, MapPin, Heart, Eye, Bell, Settings, LogOut, ChevronRight,
  Copy, Truck, CheckCircle2, Clock, XCircle, Trash2, Plus,
} from 'lucide-react'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { useOrders } from '../store/orders'
import { useCheckout } from '../store/checkout'
import { useWishlist, useRecentlyViewed } from '../store/wishlist'
import { useCatalog } from '../store/products'
import { toast } from '../store/ui'
import PageTransition from '../components/animations/PageTransition'
import SmartImage from '../components/ui/SmartImage'
import { EmptyState } from '../components/ui/misc'
import Rating from '../components/ui/Rating'
import { money, formatDate, initials, uid, isValidPhone, isValidPincode } from '../lib/utils'
import type { Address, OrderStatus } from '../data/types'

const STATUS_TONE: Record<OrderStatus, string> = {
  'Order Placed': 'bg-sky-100 text-sky-700',
  Confirmed: 'bg-violet-100 text-violet-700',
  Processing: 'bg-amber-100 text-amber-700',
  'Out for Delivery': 'bg-rose-100 text-rose-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-plum-100 text-plum-500',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${STATUS_TONE[status]}`}>{status}</span>
}

function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/account', label: 'Profile', icon: User, end: true },
    { to: '/account/orders', label: 'My Orders', icon: Package },
    { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, external: true },
  ]

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState
          icon={User}
          title="You are not signed in"
          subtitle="Sign in with the demo account (demo@velvette.shop / demo123) or create one to explore the account dashboard."
          action={<Link to="/signin" state={{ from: '/account' }} className="btn-primary btn-lg">Sign in</Link>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 font-display text-lg font-bold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-plum-900">{user.name}</p>
                <p className="truncate text-xs text-plum-400">{user.email}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1" aria-label="Account">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-rose-50 text-rose-700' : 'text-plum-600 hover:bg-plum-50'}`
                  }
                >
                  <l.icon size={16} /> {l.label}
                  {l.external && <span className="ml-auto text-[10px] text-plum-300">↗</span>}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  signOut()
                  toast.info('Signed out', 'See you soon — your cart & wishlist remain.')
                  navigate('/')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-plum-600 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut size={16} /> Sign out
              </button>
            </nav>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const orders = useOrders((s) => s.orders.filter((o) => o.customerEmail === user?.email))
  const wishlistCount = useWishlist((s) => s.ids.length)
  const recentIds = useRecentlyViewed((s) => s.ids)
  const products = useCatalog((s) => s.products)
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' })

  const recent = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Array<(typeof products)[0]>

  if (!user) return null

  return (
    <PageTransition>
      <h1 className="heading-lg text-plum-900">My Account</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Demo orders', value: orders.length, icon: Package, to: '/account/orders' },
          { label: 'Wishlist items', value: wishlistCount, icon: Heart, to: '/wishlist' },
          { label: 'Member since', value: formatDate(user.joinedAt), icon: Clock, to: undefined },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <s.icon size={20} />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-plum-900">{s.value}</p>
              <p className="text-xs text-plum-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-plum-900"><User size={18} className="text-rose-600" /> Profile information</h2>
          <button onClick={() => { setDraft({ name: user.name, phone: user.phone ?? '' }); setEdit((v) => !v) }} className="btn-outline btn-sm">
            {edit ? 'Cancel' : 'Edit profile'}
          </button>
        </div>
        {edit ? (
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (draft.name.trim().length < 2) return toast.error('Name looks too short')
              if (draft.phone && !isValidPhone(draft.phone)) return toast.error('Phone number looks invalid')
              updateProfile({ name: draft.name.trim(), phone: draft.phone })
              toast.success('Profile updated')
              setEdit(false)
            }}
          >
            <div>
              <label className="label" htmlFor="pf-name">Full name</label>
              <input id="pf-name" className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div>
              <label className="label" htmlFor="pf-phone">Phone</label>
              <input id="pf-phone" className="input" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary btn-md">Save changes</button>
            </div>
          </form>
        ) : (
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-plum-400">Name</dt><dd className="mt-0.5 font-semibold text-plum-900">{user.name}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-plum-400">Email</dt><dd className="mt-0.5 font-semibold text-plum-900">{user.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-plum-400">Phone</dt><dd className="mt-0.5 font-semibold text-plum-900">{user.phone ?? 'Not set'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-plum-400">Role</dt><dd className="mt-0.5 font-semibold capitalize text-plum-900">{user.role}</dd></div>
          </dl>
        )}
      </div>

      {recent.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold text-plum-900">Recently viewed</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {recent.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <SmartImage src={p.images[0]} alt={p.name} className="aspect-square w-full" />
                <p className="truncate px-3 py-2 text-xs font-semibold text-plum-700 group-hover:text-rose-700">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  )
}

function OrdersSection() {
  const { user } = useAuth()
  const { orders, cancelOrder } = useOrders()
  const products = useCatalog((s) => s.products)
  const { addItem } = useCart()

  const myOrders = orders.filter((o) => o.customerEmail === user?.email)

  const reorder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    order.items.forEach((it) => {
      const p = products.find((x) => x.id === it.productId)
      if (p && p.stock > 0) addItem({ productId: p.id, variantId: p.variants[0]?.id, qty: it.qty })
    })
    toast.success('Reordered', 'Items added to your cart (demo).')
  }

  const cancelable = (s: OrderStatus) => !['Delivered', 'Cancelled', 'Out for Delivery'].includes(s)

  if (myOrders.length === 0) {
    return (
      <PageTransition>
        <h1 className="heading-lg text-plum-900">My Orders</h1>
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="No orders yet"
            subtitle="When you place a demo order, it will appear here with live-ish status tracking."
            action={<Link to="/shop" className="btn-primary btn-md">Start gifting</Link>}
          />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <h1 className="heading-lg text-plum-900">My Orders</h1>
      <p className="mt-1 text-sm text-plum-500">{myOrders.length} demo order{myOrders.length === 1 ? '' : 's'} · statuses update in the admin console too</p>

      <div className="mt-6 space-y-4">
        {myOrders.map((o) => (
          <article key={o.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-plum-200 pb-3">
              <div>
                <p className="flex items-center gap-2 font-display text-base font-bold text-plum-900">
                  {o.id}
                  <button
                    onClick={() => { navigator.clipboard?.writeText(o.id); toast.success('Order ID copied') }}
                    className="rounded-full p-1 text-plum-300 hover:text-plum-600"
                    aria-label="Copy order ID"
                  >
                    <Copy size={13} />
                  </button>
                </p>
                <p className="text-xs text-plum-400">Placed {formatDate(o.date)} · {o.payment.label}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div className="mt-3 space-y-2.5">
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                    <SmartImage src={it.image} alt={it.name} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-plum-900">{it.name}</p>
                    <p className="text-xs text-plum-400">{it.variantLabel} · Qty {it.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-plum-900">{money(it.price * it.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-plum-100 pt-3">
              <p className="text-sm">
                <span className="text-plum-400">Total:</span>{' '}
                <span className="font-bold text-plum-900">{money(o.pricing.total)}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {cancelable(o.status) && (
                  <button
                    onClick={() => {
                      if (confirm(`Cancel demo order ${o.id}? This cannot be undone.`)) {
                        cancelOrder(o.id)
                        toast.info('Order cancelled', `${o.id} marked as cancelled (demo).`)
                      }
                    }}
                    className="btn-outline btn-sm"
                  >
                    Cancel order
                  </button>
                )}
                <button onClick={() => reorder(o.id)} className="btn-outline btn-sm">Reorder</button>
                <Link to={`/account/orders/${o.id}`} className="btn-dark btn-sm">View details <ChevronRight size={13} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageTransition>
  )
}

function OrderDetailSection() {
  const { orderId } = useParams()
  const { orders } = useOrders()
  const { user } = useAuth()
  const order = orders.find((o) => o.id === orderId && o.customerEmail === user?.email)
  const { addItem } = useCartReal()

  if (!order) {
    return (
      <PageTransition>
        <EmptyState icon={Package} title="Order not found" subtitle="This demo order does not exist in your history." action={<Link to="/account/orders" className="btn-primary btn-md">All orders</Link>} />
      </PageTransition>
    )
  }

  const stages = ['Order Placed', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered'] as const
  const stageIdx = stages.indexOf(order.status as (typeof stages)[number])

  return (
    <PageTransition>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-plum-500 hover:text-rose-600">
        <ChevronRight size={14} className="rotate-180" /> All orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">{order.id}</h1>
          <p className="text-sm text-plum-500">Placed {formatDate(order.date)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* progress */}
      {order.status !== 'Cancelled' && (
        <div className="card mt-6 p-6">
          <div className="flex items-center">
            {stages.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= stageIdx ? 'bg-rose-600 text-white' : 'bg-plum-100 text-plum-400'}`}>
                    {i < stageIdx ? <CheckCircle2 size={14} /> : i + 1}
                  </span>
                  <span className={`mt-1.5 hidden whitespace-nowrap text-[10px] font-semibold sm:block ${i <= stageIdx ? 'text-plum-800' : 'text-plum-300'}`}>{s}</span>
                </div>
                {i < stages.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded ${i < stageIdx ? 'bg-rose-600' : 'bg-plum-100'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-plum-900"><MapPin size={16} className="text-rose-600" /> Delivery address</h2>
          <p className="mt-2 text-sm font-semibold text-plum-900">{order.address.fullName}</p>
          <p className="text-sm text-plum-500">{order.address.line1}</p>
          <p className="text-sm text-plum-500">{order.address.city}, {order.address.state} {order.address.pincode}</p>
          <p className="text-sm text-plum-500">{order.address.phone}</p>
        </div>
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-plum-900"><Truck size={16} className="text-rose-600" /> Delivery & payment</h2>
          <p className="mt-2 text-sm font-semibold text-plum-900">{order.delivery.method}</p>
          <p className="text-sm text-plum-500">{formatDate(order.delivery.date)} · {order.delivery.slot}</p>
          <p className="text-sm text-plum-500">{order.payment.label}</p>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h2 className="font-display text-base font-bold text-plum-900">Items</h2>
        <div className="mt-3 space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                <SmartImage src={it.image} alt={it.name} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-plum-900">{it.name}</p>
                <p className="text-xs text-plum-400">{it.variantLabel} · Qty {it.qty}</p>
              </div>
              <span className="text-sm font-bold text-plum-900">{money(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-1.5 border-t border-plum-100 pt-3 text-sm">
          <div className="flex justify-between text-plum-600"><dt>Subtotal</dt><dd>{money(order.pricing.subtotal)}</dd></div>
          {order.pricing.discount > 0 && <div className="flex justify-between text-mint-deep"><dt>Discount</dt><dd>−{money(order.pricing.discount)}</dd></div>}
          <div className="flex justify-between text-plum-600"><dt>Delivery</dt><dd>{order.pricing.delivery === 0 ? 'FREE' : money(order.pricing.delivery)}</dd></div>
          <div className="flex justify-between font-bold text-plum-900"><dt>Total</dt><dd>{money(order.pricing.total)}</dd></div>
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            order.items.forEach((it) => {
              const p = useCatalog.getState().products.find((x) => x.id === it.productId)
              if (p && p.stock > 0) addItem({ productId: p.id, variantId: p.variants[0]?.id, qty: it.qty })
            })
            toast.success('Reordered', 'Items added to your cart (demo).')
          }}
          className="btn-primary btn-md"
        >
          Reorder items
        </button>
      </div>
    </PageTransition>
  )
}

function useCartReal() {
  return useCart()
}
function AddressesSection() {
  const { savedAddresses, saveAddress, deleteAddress } = useCheckout()
  const { user } = useAuth()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Address>>({})

  const openNew = () => {
    setEditing('new')
    setDraft({ label: 'Home', fullName: user?.name ?? '', phone: '', line1: '', city: '', state: '', pincode: '' })
  }

  const save = () => {
    if (!draft.fullName || !draft.line1 || !draft.city || !draft.state || !isValidPincode(draft.pincode ?? '')) {
      toast.error('Missing details', 'Fill name, address, city, state and a valid pincode.')
      return
    }
    saveAddress({
      id: editing === 'new' ? uid('adr') : (editing as string),
      label: (draft.label ?? 'Home') as string,
      fullName: draft.fullName ?? 'Customer',
      phone: draft.phone ?? '',
      line1: draft.line1 ?? '',
      landmark: draft.landmark,
      city: draft.city ?? '',
      state: draft.state ?? '',
      pincode: draft.pincode ?? '',
    })
    toast.success('Address saved')
    setEditing(null)
  }

  return (
    <PageTransition>
      <div className="flex items-center justify-between">
        <h1 className="heading-lg text-plum-900">Saved Addresses</h1>
        <button onClick={openNew} className="btn-primary btn-sm"><Plus size={14} /> Add address</button>
      </div>

      {editing === 'new' && (
        <div className="card mt-5 space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Label</label><input className="input" value={draft.label ?? ''} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} /></div>
            <div><label className="label">Full name</label><input className="input" value={draft.fullName ?? ''} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} /></div>
            <div><label className="label">Phone</label><input className="input" value={draft.phone ?? ''} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} /></div>
            <div><label className="label">Pincode</label><input className="input" value={draft.pincode ?? ''} onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={draft.line1 ?? ''} onChange={(e) => setDraft((d) => ({ ...d, line1: e.target.value }))} /></div>
            <div><label className="label">City</label><input className="input" value={draft.city ?? ''} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} /></div>
            <div><label className="label">State</label><input className="input" value={draft.state ?? ''} onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary btn-md">Save address</button>
            <button onClick={() => setEditing(null)} className="btn-ghost btn-md">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {savedAddresses.length === 0 && !editing && (
          <div className="sm:col-span-2">
            <EmptyState icon={MapPin} title="No saved addresses" subtitle="Save an address at checkout or add one here to speed up future demo orders." />
          </div>
        )}
        {savedAddresses.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between">
              <span className="badge bg-rose-50 text-rose-700">{a.label}</span>
              <button onClick={() => { deleteAddress(a.id); toast.info('Address removed') }} aria-label="Delete address" className="rounded-full p-1.5 text-plum-300 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 size={15} />
              </button>
            </div>
            <p className="mt-2 text-sm font-bold text-plum-900">{a.fullName}</p>
            <p className="text-sm text-plum-500">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
            <p className="text-sm text-plum-400">{a.phone}</p>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}

export default function Account() {
  return (
    <AccountShell>
      <Routes>
        <Route index element={<ProfileSection />} />
        <Route path="orders" element={<OrdersSection />} />
        <Route path="orders/:orderId" element={<OrderDetailSection />} />
        <Route path="addresses" element={<AddressesSection />} />
        <Route path="*" element={<ProfileSection />} />
      </Routes>
    </AccountShell>
  )
}
