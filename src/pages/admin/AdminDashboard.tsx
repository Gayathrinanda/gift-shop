import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, IndianRupee, ShoppingBag, Package, Users, Clock,
  AlertTriangle, ArrowUpRight, Plus, ArrowRight, TrendingUp,
} from 'lucide-react'
import { useOrders } from '../../store/orders'
import { useCatalog } from '../../store/products'
import { useAuth } from '../../store/auth'
import { StatusBadge } from '../Account'
import { money, formatDate } from '../../lib/utils'

/** Lightweight inline SVG charts (no chart library needed). */
function AreaChart({ data, height = 180, stroke = '#b4123f', fill = 'rgba(180,18,63,0.12)' }: { data: number[]; height?: number; stroke?: string; fill?: string }) {
  const max = Math.max(...data, 1)
  const w = 560
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, height - (v / max) * (height - 24) - 8 ] as const)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L${w},${height} L0,${height} Z`
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img" aria-label="Trend chart">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="#ede1e8" strokeDasharray="4 6" />
      ))}
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={stroke} />
      ))}
    </svg>
  )
}

function DonutChart({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1
  let acc = 0
  const R = 54
  const C = 2 * Math.PI * R
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        {segments.map((s) => {
          const frac = s.value / total
          const el = (
            <circle
              key={s.label}
              cx="70" cy="70" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-acc * C}
            />
          )
          acc += frac
          return el
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
            <span className="text-plum-600">{s.label}</span>
            <span className="font-bold text-plum-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BarChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-3">
          <span className="w-32 flex-shrink-0 truncate text-xs font-semibold text-plum-600">{i.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-plum-100">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-700" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
          <span className="w-14 text-right text-xs font-bold text-plum-900">{i.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const orders = useOrders((s) => s.orders)
  const products = useCatalog((s) => s.products)
  const users = useAuth((s) => s.user)

  const revenue = useMemo(
    () => orders.filter((o) => o.status !== 'Cancelled').reduce((n, o) => n + o.pricing.total, 0),
    [orders],
  )
  const pending = orders.filter((o) => ['Order Placed', 'Confirmed', 'Processing'].includes(o.status)).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  // revenue by month (demo derivation)
  const monthly = useMemo(() => {
    const arr = Array(12).fill(0) as number[]
    orders.forEach((o) => {
      const m = new Date(o.date).getMonth()
      arr[m] += o.pricing.total
    })
    // add a demo baseline so charts look alive
    const baseline = [52, 61, 58, 70, 66, 79, 88, 74, 95, 102, 91, 84]
    return arr.map((v, i) => Math.round(v / 1000 + baseline[i]))
  }, [orders])

  const categorySales = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) =>
      o.items.forEach((it) => {
        const p = products.find((x) => x.id === it.productId)
        const cat = p?.category ?? 'other'
        counts[cat] = (counts[cat] ?? 0) + it.qty
      }),
    )
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }))
  }, [orders, products])

  const statusDist = useMemo(() => {
    const tones = ['#b4123f', '#c98a2d', '#7da98f', '#8d6478', '#5f0a22', '#b795a6']
    const map: Record<string, number> = {}
    orders.forEach((o) => { map[o.status] = (map[o.status] ?? 0) + 1 })
    return Object.entries(map).map(([label, value], i) => ({ label, value, color: tones[i % tones.length] }))
  }, [orders])

  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => o.items.forEach((it) => { counts[it.productId] = (counts[it.productId] ?? 0) + it.qty }))
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({ label: products.find((p) => p.id === id)?.name ?? id, value: qty }))
  }, [orders, products])

  const statCards = [
    { label: 'Total Revenue (demo)', value: money(revenue), icon: IndianRupee, tone: 'bg-rose-50 text-rose-600', sub: '+18% vs last month' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, tone: 'bg-violet-100 text-violet-700', sub: `${pending} pending fulfillment` },
    { label: 'Total Products', value: products.length, icon: Package, tone: 'bg-emerald-100 text-emerald-700', sub: `${outOfStock} out of stock` },
    { label: 'Customers (demo)', value: 6, icon: Users, tone: 'bg-amber-100 text-amber-700', sub: '+2 this month' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">Dashboard</h1>
          <p className="mt-1 text-sm text-plum-500">Morning, Admin — here is your demo store at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/new" className="btn-primary btn-sm"><Plus size={14} /> Add product</Link>
          <Link to="/admin/orders" className="btn-outline btn-sm">View orders</Link>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="card flex items-start gap-4 p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.tone}`}>
              <c.icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-plum-400">{c.label}</p>
              <p className="mt-0.5 font-display text-2xl font-bold text-plum-900">{c.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-mint-deep">
                <ArrowUpRight size={12} /> {c.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-plum-900">Revenue overview</h2>
            <span className="badge bg-rose-50 text-rose-700">Demo data · ₹ '000s</span>
          </div>
          <div className="mt-4">
            <AreaChart data={monthly} />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-plum-300">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-plum-900">Order status</h2>
          <div className="mt-4">
            {statusDist.length > 0 ? <DonutChart segments={statusDist} /> : <p className="text-sm text-plum-400">No orders yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-plum-900">Sales by category</h2>
          <div className="mt-4">
            {categorySales.length ? <BarChart items={categorySales} /> : <p className="text-sm text-plum-400">No sales yet.</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-plum-900">Top-selling products</h2>
          <div className="mt-4">
            {topProducts.length ? <BarChart items={topProducts} /> : <p className="text-sm text-plum-400">No sales yet.</p>}
          </div>
        </div>
      </div>

      {/* recent orders + quick actions */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-plum-900">Recent orders</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-rose-600 hover:underline">All orders <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-plum-100 text-left text-xs uppercase tracking-wider text-plum-400">
                  <th className="py-2.5 pr-3">Order</th><th className="py-2.5 pr-3">Customer</th><th className="py-2.5 pr-3">Date</th><th className="py-2.5 pr-3">Amount</th><th className="py-2.5 pr-3">Status</th><th />
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-b border-plum-50 last:border-0">
                    <td className="py-3 pr-3 font-bold text-plum-900">{o.id}</td>
                    <td className="py-3 pr-3 text-plum-600">{o.customerName}</td>
                    <td className="py-3 pr-3 text-plum-500">{formatDate(o.date)}</td>
                    <td className="py-3 pr-3 font-bold text-plum-900">{money(o.pricing.total)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                    <td className="py-3">
                      <Link to={`/admin/orders/${o.id}`} className="text-xs font-bold text-rose-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-plum-900">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { to: '/admin/products/new', label: 'Add Product', icon: Plus },
              { to: '/admin/orders', label: 'View Orders', icon: ShoppingBag },
              { to: '/admin/categories', label: 'Manage Categories', icon: Package },
              { to: '/admin/coupons', label: 'Create Coupon', icon: IndianRupee },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-2xl border border-plum-100 px-4 py-3 text-sm font-semibold text-plum-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                <a.icon size={16} /> {a.label} <ArrowRight size={14} className="ml-auto opacity-40" />
              </Link>
            ))}
          </div>
          {outOfStock > 0 && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-700"><AlertTriangle size={15} /> {outOfStock} products out of stock</p>
              <Link to="/admin/products?stock=out" className="mt-1 inline-block text-xs font-bold text-amber-700 underline">Review products</Link>
            </div>
          )}
          {users && (
            <p className="mt-4 rounded-2xl bg-plum-50 p-3 text-[11px] text-plum-400">Signed in as {users.email} (customer session)</p>
          )}
        </div>
      </div>
    </div>
  )
}
