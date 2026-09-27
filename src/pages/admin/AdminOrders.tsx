import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Search, ShoppingBag } from 'lucide-react'
import { useOrders } from '../../store/orders'
import { StatusBadge } from '../Account'
import Modal from '../../components/ui/Modal'
import SmartImage from '../../components/ui/SmartImage'
import { money, formatDate } from '../../lib/utils'
import { toast } from '../../store/ui'
import type { OrderStatus } from '../../data/types'

const STATUSES: OrderStatus[] = ['Order Placed', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled']

export function AdminOrders() {
  const { orders, updateStatus, cancelOrder } = useOrders()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const perPage = 10

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => {
          if (q && !`${o.id} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(q.toLowerCase())) return false
          if (status && o.status !== status) return false
          return true
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [orders, q, status],
  )
  const paged = filtered.slice(page * perPage, page * perPage + perPage)

  return (
    <div>
      <div>
        <h1 className="heading-lg text-plum-900">Orders</h1>
        <p className="mt-1 text-sm text-plum-500">{orders.length} demo orders · status changes sync to customer accounts</p>
      </div>

      <div className="card mt-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search by order ID or customer…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
        </div>
        <select className="input w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-plum-100 text-left text-xs uppercase tracking-wider text-plum-400">
              <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Date</th>
              <th className="p-4">Items</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((o) => (
              <tr key={o.id} className="border-b border-plum-50 last:border-0 hover:bg-plum-50/50">
                <td className="p-4 font-bold text-plum-900">{o.id}</td>
                <td className="p-4">
                  <p className="font-semibold text-plum-800">{o.customerName}</p>
                  <p className="text-xs text-plum-400">{o.customerEmail}</p>
                </td>
                <td className="p-4 text-plum-500">{formatDate(o.date)}</td>
                <td className="p-4 text-plum-600">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td className="p-4 font-bold text-plum-900">{money(o.pricing.total)}</td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
                <td className="p-4">
                  <div className="flex justify-end">
                    <Link to={`/admin/orders/${o.id}`} className="btn-outline btn-sm">View</Link>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-plum-400">No orders match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > perPage && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-plum-400">{filtered.length} orders</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-outline btn-sm">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * perPage >= filtered.length} className="btn-outline btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminOrderDetail() {
  const { orderId } = useParams()
  const { orders, updateStatus, cancelOrder } = useOrders()
  const order = orders.find((o) => o.id === orderId)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!order) {
    return (
      <div className="card p-10 text-center">
        <ShoppingBag size={36} className="mx-auto text-plum-300" />
        <p className="mt-3 font-semibold text-plum-700">Order not found</p>
        <Link to="/admin/orders" className="btn-primary btn-md mt-4 inline-flex">All orders</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-plum-500 hover:text-rose-600">
        <ChevronLeft size={15} /> All orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">{order.id}</h1>
          <p className="text-sm text-plum-500">Placed {formatDate(order.date)} · {order.payment.label}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="card p-5">
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
              {order.pricing.discount > 0 && <div className="flex justify-between text-mint-deep"><dt>Discount {order.pricing.couponCode ? `(${order.pricing.couponCode})` : ''}</dt><dd>−{money(order.pricing.discount)}</dd></div>}
              <div className="flex justify-between text-plum-600"><dt>Delivery</dt><dd>{order.pricing.delivery === 0 ? 'FREE' : money(order.pricing.delivery)}</dd></div>
              <div className="flex justify-between text-base font-bold text-plum-900"><dt>Total</dt><dd>{money(order.pricing.total)}</dd></div>
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-plum-900">Customer</h2>
              <p className="mt-2 text-sm font-semibold text-plum-900">{order.customerName}</p>
              <p className="text-sm text-plum-500">{order.customerEmail}</p>
              <p className="text-sm text-plum-500">{order.address.phone}</p>
            </div>
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-plum-900">Delivery</h2>
              <p className="mt-2 text-sm font-semibold text-plum-900">{order.address.fullName}</p>
              <p className="text-sm text-plum-500">{order.address.line1}</p>
              <p className="text-sm text-plum-500">{order.address.city}, {order.address.state} {order.address.pincode}</p>
              <p className="mt-1 text-sm text-plum-500">{order.delivery.method} · {order.delivery.slot}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-plum-900">Update status</h2>
            <div className="mt-3 space-y-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    updateStatus(order.id, s)
                    toast.success('Status updated', `${order.id} → ${s}. Visible in the customer's account too.`)
                  }}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                    order.status === s ? 'bg-rose-600 text-white' : 'bg-plum-50 text-plum-600 hover:bg-plum-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button onClick={() => setConfirmCancel(true)} className="btn-outline btn-md mt-4 w-full text-rose-600">
                Cancel order
              </button>
            )}
          </div>
          {order.giftNote && (
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-plum-900">Gift note</h2>
              <p className="mt-2 rounded-xl bg-rose-50 p-3 text-sm italic text-rose-700">“{order.giftNote}”</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel order">
        <p className="text-sm text-plum-600">Cancel {order.id}? The customer will see it as cancelled in their order history (demo).</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setConfirmCancel(false)} className="btn-ghost btn-md">Keep order</button>
          <button
            onClick={() => { cancelOrder(order.id); toast.info('Order cancelled', order.id); setConfirmCancel(false) }}
            className="btn bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700"
          >
            Cancel order
          </button>
        </div>
      </Modal>
    </div>
  )
}
