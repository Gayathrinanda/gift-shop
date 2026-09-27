import { useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Save, BarChart3 } from 'lucide-react'
import { useCatalog } from '../../store/products'
import Modal from '../../components/ui/Modal'
import { CUSTOMERS } from '../../data/demo'
import { useCoupons, useBanners, useReviews } from '../../store/merch'
import { useOrders } from '../../store/orders'
import { Stars } from '../../components/ui/Rating'
import { PRODUCT_MAP } from '../../data/products'
import { money, formatDate } from '../../lib/utils'
import { toast } from '../../store/ui'

/* ————— Customers ————— */
export function AdminCustomers() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [viewing, setViewing] = useState<(typeof CUSTOMERS)[0] | null>(null)
  const orders = useOrders((s) => s.orders)

  const filtered = CUSTOMERS.filter((c) => {
    if (q && !`${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase())) return false
    if (status && c.status !== status) return false
    return true
  })

  return (
    <div>
      <h1 className="heading-lg text-plum-900">Customers</h1>
      <p className="mt-1 text-sm text-plum-500">Demo customer directory merged with any live demo orders.</p>

      <div className="card mt-5 flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search name, email or city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option>Active</option><option>Blocked</option>
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-plum-100 text-left text-xs uppercase tracking-wider text-plum-400">
              <th className="p-4">Customer</th><th className="p-4">City</th><th className="p-4">Joined</th>
              <th className="p-4">Orders</th><th className="p-4">Lifetime value</th><th className="p-4">Status</th><th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const liveCount = orders.filter((o) => o.customerEmail === c.email).length
              return (
                <tr key={c.id} className="border-b border-plum-50 last:border-0 hover:bg-plum-50/50">
                  <td className="p-4">
                    <p className="font-semibold text-plum-900">{c.name}</p>
                    <p className="text-xs text-plum-400">{c.email}</p>
                  </td>
                  <td className="p-4 text-plum-600">{c.city}</td>
                  <td className="p-4 text-plum-500">{formatDate(c.joinedAt)}</td>
                  <td className="p-4 font-bold text-plum-900">{Math.max(c.orderCount, liveCount)}</td>
                  <td className="p-4 font-bold text-plum-900">{money(c.totalValue)}</td>
                  <td className="p-4">
                    <span className={`badge ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setViewing(c)} className="btn-outline btn-sm">Details</button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-plum-400">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Customer details">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 font-display text-xl font-bold text-white">
                {viewing.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </span>
              <div>
                <p className="font-display text-lg font-bold text-plum-900">{viewing.name}</p>
                <p className="text-plum-400">{viewing.email} · {viewing.phone}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-plum-50 p-3"><dt className="text-xs text-plum-400">City</dt><dd className="font-bold text-plum-900">{viewing.city}</dd></div>
              <div className="rounded-2xl bg-plum-50 p-3"><dt className="text-xs text-plum-400">Joined</dt><dd className="font-bold text-plum-900">{formatDate(viewing.joinedAt)}</dd></div>
              <div className="rounded-2xl bg-plum-50 p-3"><dt className="text-xs text-plum-400">Orders</dt><dd className="font-bold text-plum-900">{viewing.orderCount}</dd></div>
              <div className="rounded-2xl bg-plum-50 p-3"><dt className="text-xs text-plum-400">Lifetime value</dt><dd className="font-bold text-plum-900">{money(viewing.totalValue)}</dd></div>
            </dl>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-plum-400">Order history (demo)</p>
              {orders.filter((o) => o.customerEmail === viewing.email).map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b border-plum-50 py-2">
                  <span className="font-semibold text-plum-800">{o.id}</span>
                  <span className="text-plum-500">{formatDate(o.date)}</span>
                  <span className="font-bold">{money(o.pricing.total)}</span>
                </div>
              ))}
              {orders.filter((o) => o.customerEmail === viewing.email).length === 0 && (
                <p className="text-plum-400">No live demo orders for this customer yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ————— Coupons ————— */
export function AdminCoupons() {
  const { coupons, add, update, remove } = useCoupons()
  const [editing, setEditing] = useState<null | { code: string; type: 'percent' | 'flat'; value: string; minOrder: string; expiry: string; active: boolean; description: string; isNew: boolean }>(null)

  const openNew = () =>
    setEditing({ code: '', type: 'percent', value: '10', minOrder: '499', expiry: '2027-12-31', active: true, description: '', isNew: true })

  const openEdit = (c: (typeof coupons)[0]) =>
    setEditing({ code: c.code, type: c.type, value: String(c.value), minOrder: String(c.minOrder), expiry: c.expiry, active: c.active, description: c.description, isNew: false })

  const save = () => {
    if (!editing) return
    if (!/^[A-Z0-9]{4,15}$/.test(editing.code.toUpperCase())) {
      toast.error('Invalid code', 'Use 4–15 letters/numbers.')
      return
    }
    const payload = {
      code: editing.code.toUpperCase(),
      type: editing.type,
      value: Number(editing.value),
      minOrder: Number(editing.minOrder),
      expiry: editing.expiry,
      active: editing.active,
      description: editing.description || `${editing.type === 'percent' ? `${editing.value}% off` : `₹${editing.value} off`} orders ₹${editing.minOrder}+`,
    }
    if (editing.isNew) {
      add(payload)
      toast.success('Coupon created', `${payload.code} is live in the demo cart.`)
    } else {
      update(editing.code, payload)
      toast.success('Coupon updated')
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">Coupons</h1>
          <p className="mt-1 text-sm text-plum-500">These codes work live in the customer cart.</p>
        </div>
        <button onClick={openNew} className="btn-primary btn-sm"><Plus size={14} /> Create coupon</button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.code} className="card relative overflow-hidden p-5">
            <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-rose-500 to-gold" />
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-lg font-bold tracking-wider text-plum-900">{c.code}</p>
                <p className="mt-0.5 text-xs text-plum-500">{c.description}</p>
              </div>
              <span className={`badge ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-plum-100 text-plum-400'}`}>{c.active ? 'Active' : 'Inactive'}</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-plum-50 p-2"><dt className="text-plum-400">Value</dt><dd className="font-bold text-plum-900">{c.type === 'percent' ? `${c.value}%` : money(c.value)}</dd></div>
              <div className="rounded-xl bg-plum-50 p-2"><dt className="text-plum-400">Min order</dt><dd className="font-bold text-plum-900">{money(c.minOrder)}</dd></div>
              <div className="rounded-xl bg-plum-50 p-2"><dt className="text-plum-400">Expiry</dt><dd className="font-bold text-plum-900">{c.expiry}</dd></div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-plum-100 pt-3">
              <button onClick={() => update(c.code, { active: !c.active })} className="text-xs font-bold text-plum-500 hover:text-rose-600">
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100" aria-label={`Edit ${c.code}`}><Pencil size={15} /></button>
                <button onClick={() => { remove(c.code); toast.info('Coupon deleted', c.code) }} className="rounded-lg p-2 text-plum-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${c.code}`}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.isNew ? 'Create coupon' : 'Edit coupon'}>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label">Coupon code</label>
              <input className="input font-mono uppercase" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="SPARKLE15" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as 'percent' | 'flat' })}>
                  <option value="percent">Percent %</option><option value="flat">Flat ₹</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input type="number" className="input" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
              </div>
              <div>
                <label className="label">Min order (₹)</label>
                <input type="number" className="input" value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: e.target.value })} />
              </div>
              <div>
                <label className="label">Expiry</label>
                <input type="date" className="input" value={editing.expiry} onChange={(e) => setEditing({ ...editing, expiry: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Description shown to customers</label>
              <input className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="15% off orders ₹999+" />
            </div>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-plum-700">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 rounded accent-rose-600" /> Active
            </label>
            <button onClick={save} className="btn-primary btn-md w-full"><Save size={15} /> Save coupon</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ————— Banners ————— */
export function AdminBanners() {
  const { banners, add, update, remove } = useBanners()
  const [editing, setEditing] = useState<null | { id?: string; title: string; subtitle: string; cta: string; link: string; tone: 'rose' | 'plum' | 'gold' | 'mint' | 'blush'; active: boolean; order: number; isNew: boolean }>(null)

  const openNew = () => setEditing({ title: '', subtitle: '', cta: 'Shop now', link: '/shop', tone: 'rose', active: true, order: banners.length + 1, isNew: true })

  const save = () => {
    if (!editing) return
    if (editing.title.trim().length < 3) {
      toast.error('Title too short')
      return
    }
    if (editing.isNew) {
      add({ title: editing.title, subtitle: editing.subtitle, cta: editing.cta, link: editing.link, image: '', tone: editing.tone, active: editing.active, order: editing.order })
      toast.success('Banner created', 'It now appears on the homepage (demo).')
    } else if (editing.id) {
      update(editing.id, { title: editing.title, subtitle: editing.subtitle, cta: editing.cta, link: editing.link, tone: editing.tone, active: editing.active, order: editing.order })
      toast.success('Banner updated')
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">Banners</h1>
          <p className="mt-1 text-sm text-plum-500">Active banners render in the homepage promo section.</p>
        </div>
        <button onClick={openNew} className="btn-primary btn-sm"><Plus size={14} /> Add banner</button>
      </div>

      <div className="mt-6 space-y-3">
        {banners.sort((a, b) => a.order - b.order).map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center gap-4 p-4">
            <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${
              b.tone === 'rose' ? 'bg-rose-600' : b.tone === 'plum' ? 'bg-plum-800' : b.tone === 'gold' ? 'bg-gold' : b.tone === 'mint' ? 'bg-mint-deep' : 'bg-rose-400'
            } text-white`}>
              {b.order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-plum-900">{b.title}</p>
              <p className="truncate text-xs text-plum-400">{b.subtitle} · links to {b.link}</p>
            </div>
            <span className={`badge ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-plum-100 text-plum-400'}`}>{b.active ? 'Live' : 'Hidden'}</span>
            <div className="flex gap-1">
              <button onClick={() => update(b.id, { active: !b.active })} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100" aria-label="Toggle active">
                {b.active ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button onClick={() => setEditing({ id: b.id, title: b.title, subtitle: b.subtitle, cta: b.cta, link: b.link, tone: b.tone, active: b.active, order: b.order, isNew: false })} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100" aria-label="Edit banner"><Pencil size={15} /></button>
              <button onClick={() => { remove(b.id); toast.info('Banner removed') }} className="rounded-lg p-2 text-plum-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete banner"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.isNew ? 'Add banner' : 'Edit banner'}>
        {editing && (
          <div className="space-y-4">
            <div><label className="label">Title</label><input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className="label">Subtitle</label><input className="input" value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">CTA label</label><input className="input" value={editing.cta} onChange={(e) => setEditing({ ...editing, cta: e.target.value })} /></div>
              <div>
                <label className="label">Link</label>
                <select className="input" value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })}>
                  {['/shop', '/category/flowers', '/category/cakes', '/category/hampers', '/category/personalized', '/category/same-day', '/category/anniversary'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tone</label>
                <select className="input" value={editing.tone} onChange={(e) => setEditing({ ...editing, tone: e.target.value as typeof editing.tone })}>
                  <option value="rose">Rose</option><option value="plum">Plum</option><option value="gold">Gold</option><option value="mint">Mint</option><option value="blush">Blush</option>
                </select>
              </div>
              <div><label className="label">Display order</label><input type="number" className="input" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-plum-700">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 rounded accent-rose-600" /> Active on homepage
            </label>
            <button onClick={save} className="btn-primary btn-md w-full"><Save size={15} /> Save banner</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ————— Reviews ————— */
export function AdminReviews() {
  const { reviews, toggleApproved, remove } = useReviews()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('')

  const filtered = reviews.filter((r) => {
    const product = PRODUCT_MAP[r.productId]?.name ?? ''
    if (q && !`${product} ${r.customerName} ${r.text}`.toLowerCase().includes(q.toLowerCase())) return false
    if (filter === 'approved' && !r.approved) return false
    if (filter === 'hidden' && r.approved) return false
    return true
  })

  return (
    <div>
      <h1 className="heading-lg text-plum-900">Reviews</h1>
      <p className="mt-1 text-sm text-plum-500">Hidden reviews disappear from product pages instantly.</p>

      <div className="card mt-5 flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search product, customer or text…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter reviews">
          <option value="">All reviews</option>
          <option value="approved">Approved only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className={`card flex flex-wrap items-center gap-4 p-4 ${!r.approved ? 'opacity-60' : ''}`}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-plum-900">{PRODUCT_MAP[r.productId]?.name ?? r.productId}</p>
                <Stars value={r.rating} />
                {!r.approved && <span className="badge bg-plum-100 text-plum-400">Hidden</span>}
              </div>
              <p className="mt-1 text-sm text-plum-500">“{r.text}”</p>
              <p className="mt-1 text-xs text-plum-400">{r.customerName} · {formatDate(r.date)}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { toggleApproved(r.id); toast.info(r.approved ? 'Review hidden' : 'Review approved') }}
                className="btn-outline btn-sm"
              >
                {r.approved ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Approve</>}
              </button>
              <button onClick={() => { remove(r.id); toast.info('Review deleted') }} className="rounded-lg p-2 text-plum-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete review">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="card p-10 text-center text-plum-400">No reviews match your filters.</p>}
      </div>
    </div>
  )
}

/* ————— Analytics ————— */
export function AdminAnalytics() {
  const orders = useOrders((s) => s.orders)
  const products = useCatalog((s) => s.products)

  const aov = orders.length ? orders.reduce((n, o) => n + o.pricing.total, 0) / orders.length : 0
  const delivered = orders.filter((o) => o.status === 'Delivered').length
  const cancelled = orders.filter((o) => o.status === 'Cancelled').length
  const couponSavings = orders.reduce((n, o) => n + o.pricing.discount, 0)

  const byCity = useMemo(() => {
    const m: Record<string, number> = {}
    orders.forEach((o) => { m[o.address.city] = (m[o.address.city] ?? 0) + o.pricing.total })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value: Math.round(value) }))
  }, [orders])

  return (
    <div>
      <h1 className="heading-lg text-plum-900">Analytics</h1>
      <p className="mt-1 text-sm text-plum-500">Demo metrics derived from order data in this browser.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Average order value', value: money(Math.round(aov)) },
          { label: 'Delivered orders', value: delivered },
          { label: 'Cancellation rate', value: orders.length ? `${Math.round((cancelled / orders.length) * 100)}%` : '0%' },
          { label: 'Coupon savings given', value: money(couponSavings) },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-plum-400">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-plum-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-plum-900"><BarChart3 size={18} className="text-rose-600" /> Revenue by city</h2>
        <div className="mt-4 space-y-3">
          {byCity.map((c) => {
            const max = Math.max(...byCity.map((x) => x.value), 1)
            return (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm font-semibold text-plum-600">{c.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-plum-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-rose-600" style={{ width: `${(c.value / max) * 100}%` }} />
                </div>
                <span className="w-24 text-right text-xs font-bold text-plum-900">{money(c.value)}</span>
              </div>
            )
          })}
          {byCity.length === 0 && <p className="text-sm text-plum-400">No order data yet.</p>}
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h2 className="font-display text-lg font-bold text-plum-900">Catalog snapshot</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
          <div className="rounded-2xl bg-plum-50 p-4"><p className="text-2xl font-bold text-plum-900">{products.length}</p><p className="text-plum-400">Products</p></div>
          <div className="rounded-2xl bg-plum-50 p-4"><p className="text-2xl font-bold text-plum-900">{products.filter((p) => p.featured).length}</p><p className="text-plum-400">Featured</p></div>
          <div className="rounded-2xl bg-plum-50 p-4"><p className="text-2xl font-bold text-plum-900">{products.filter((p) => p.stock === 0).length}</p><p className="text-plum-400">Out of stock</p></div>
          <div className="rounded-2xl bg-plum-50 p-4"><p className="text-2xl font-bold text-plum-900">{products.filter((p) => p.originalPrice).length}</p><p className="text-plum-400">On discount</p></div>
        </div>
      </div>
    </div>
  )
}

/* ————— Settings ————— */
export function AdminSettings() {
  const [store, setStore] = useState({ name: 'Velvette Gifting', email: 'care@velvette.shop', phone: '1800-VELVETTE', currency: 'INR ₹', freeAbove: '999' })
  const [notify, setNotify] = useState({ orders: true, stock: true, reviews: false, weekly: true })
  const [delivery, setDelivery] = useState({ sameDayCutoff: '18:00', expressFee: '149', metros: 'Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Chennai, Kolkata' })

  return (
    <div className="max-w-3xl">
      <h1 className="heading-lg text-plum-900">Settings</h1>
      <p className="mt-1 text-sm text-plum-500">Demo settings — nothing here touches a real store.</p>

      <div className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-plum-900">Store details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Store name</label><input className="input" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} /></div>
          <div><label className="label">Support email</label><input className="input" value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} /></div>
          <div><label className="label">Support phone</label><input className="input" value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} /></div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })}>
              <option>INR ₹</option><option>USD $</option><option>EUR €</option>
            </select>
          </div>
          <div><label className="label">Free delivery above (₹)</label><input className="input" value={store.freeAbove} onChange={(e) => setStore({ ...store, freeAbove: e.target.value })} /></div>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <h2 className="font-display text-lg font-bold text-plum-900">Notifications</h2>
        <div className="mt-4 space-y-3">
          {[
            { k: 'orders' as const, label: 'New order alerts' },
            { k: 'stock' as const, label: 'Low stock alerts' },
            { k: 'reviews' as const, label: 'New review alerts' },
            { k: 'weekly' as const, label: 'Weekly summary email (demo)' },
          ].map((n) => (
            <label key={n.k} className="flex cursor-pointer items-center justify-between rounded-2xl border border-plum-100 px-4 py-3 text-sm font-semibold text-plum-700">
              {n.label}
              <input type="checkbox" checked={notify[n.k]} onChange={(e) => setNotify({ ...notify, [n.k]: e.target.checked })} className="h-4 w-4 rounded accent-rose-600" />
            </label>
          ))}
        </div>
      </div>

      <div className="card mt-4 p-6">
        <h2 className="font-display text-lg font-bold text-plum-900">Delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Same-day cutoff</label><input className="input" value={delivery.sameDayCutoff} onChange={(e) => setDelivery({ ...delivery, sameDayCutoff: e.target.value })} /></div>
          <div><label className="label">Express fee (₹)</label><input className="input" value={delivery.expressFee} onChange={(e) => setDelivery({ ...delivery, expressFee: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Metro cities</label><input className="input" value={delivery.metros} onChange={(e) => setDelivery({ ...delivery, metros: e.target.value })} /></div>
        </div>
      </div>

      <button onClick={() => toast.success('Settings saved (demo)', 'Stored for this session only.')} className="btn-primary btn-lg mt-6">
        <Save size={16} /> Save settings
      </button>
    </div>
  )
}
