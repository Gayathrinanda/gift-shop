import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, Copy, ArrowRight, MapPin } from 'lucide-react'
import { useOrders } from '../store/orders'
import PageTransition from '../components/animations/PageTransition'
import ConfettiEffect from '../components/ui/ConfettiEffect'
import { EmptyState } from '../components/ui/misc'
import SmartImage from '../components/ui/SmartImage'
import { money, formatDateLong } from '../lib/utils'
import { toast } from '../store/ui'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId))
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 350)
    const t2 = setTimeout(() => setBurst(false), 2600)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [orderId])

  if (!order) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <EmptyState
            icon={Package}
            title="Order not found"
            subtitle="We could not find this demo order. It may belong to a different browser session."
            action={<Link to="/shop" className="btn-primary btn-md">Continue shopping</Link>}
          />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-2xl px-6 py-14">
        <ConfettiEffect active={burst} count={34} />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/15"
        >
          <CheckCircle2 size={44} className="text-mint-deep" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 text-center">
          <h1 className="heading-lg text-plum-900">It’s on its way! 🎉</h1>
          <p className="mt-2 text-sm text-plum-500">
            Your demo order is confirmed. A real courier has not been dispatched — this is a frontend celebration.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="card mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-plum-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-plum-400">Demo order ID</p>
              <p className="mt-0.5 flex items-center gap-2 font-display text-xl font-bold text-plum-900">
                {order.id}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(order.id)
                    toast.success('Order ID copied')
                  }}
                  aria-label="Copy order ID"
                  className="rounded-full p-1.5 text-plum-300 transition hover:bg-plum-100 hover:text-plum-700"
                >
                  <Copy size={14} />
                </button>
              </p>
            </div>
            <span className="badge bg-rose-50 text-rose-700">{order.status}</span>
          </div>

          <div className="mt-4 space-y-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                  <SmartImage src={it.image} alt={it.name} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-plum-900">{it.name}</p>
                  <p className="text-xs text-plum-400">{it.variantLabel} · Qty {it.qty}</p>
                </div>
                <span className="text-sm font-bold">{money(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 border-t border-plum-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-plum-400"><MapPin size={12} /> Deliver to</p>
              <p className="mt-1 font-semibold text-plum-900">{order.address.fullName}</p>
              <p className="text-plum-500">{order.address.line1}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-plum-400"><Truck size={12} /> Delivery</p>
              <p className="mt-1 font-semibold text-plum-900">{order.delivery.method}</p>
              <p className="text-plum-500">{formatDateLong(order.delivery.date)} · {order.delivery.slot}</p>
              <p className="text-plum-500">{order.payment.label}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-plum-100 pt-4 text-sm">
            <div className="flex justify-between text-plum-600"><dt>Subtotal</dt><dd className="font-semibold">{money(order.pricing.subtotal)}</dd></div>
            {order.pricing.discount > 0 && <div className="flex justify-between text-mint-deep"><dt>Discount {order.pricing.couponCode ? `(${order.pricing.couponCode})` : ''}</dt><dd>−{money(order.pricing.discount)}</dd></div>}
            <div className="flex justify-between text-plum-600"><dt>Delivery</dt><dd>{order.pricing.delivery === 0 ? 'FREE' : money(order.pricing.delivery)}</dd></div>
            <div className="flex justify-between border-t border-plum-100 pt-2 text-base font-bold text-plum-900"><dt>Total paid (demo)</dt><dd>{money(order.pricing.total)}</dd></div>
          </dl>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/account/orders" className="btn-primary btn-lg">Track in My Orders <ArrowRight size={16} /></Link>
          <Link to="/shop" className="btn-outline btn-lg">Continue shopping</Link>
        </motion.div>
      </div>
    </PageTransition>
  )
}
