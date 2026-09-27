import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Check, MapPin, Truck, CreditCard, Wallet,
  Banknote, Smartphone, ShoppingBag, Lock, CalendarClock,
} from 'lucide-react'
import { useCart, computeTotals, deliveryFeeFor } from '../store/cart'
import { useCatalog } from '../store/products'
import { useCheckout, newAddressId } from '../store/checkout'
import { useOrders } from '../store/orders'
import { useAuth } from '../store/auth'
import { toast } from '../store/ui'
import PageTransition from '../components/animations/PageTransition'
import SmartImage from '../components/ui/SmartImage'
import { EmptyState } from '../components/ui/misc'
import { money, isValidPincode, isValidPhone, addDays, uid } from '../lib/utils'
import type { Address, Order, PaymentMethod } from '../data/types'

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'] as const

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clear } = useCart()
  const products = useCatalog((s) => s.products)
  const deliveryMethod = useCart((s) => s.deliveryMethod)
  const setCartDeliveryMethod = useCart((s) => s.setDeliveryMethod)
  const totals = computeTotals(useCart())
  const checkout = useCheckout()
  const placeOrder = useOrders((s) => s.placeOrder)
  const user = useAuth((s) => s.user)

  const [form, setForm] = useState<Partial<Address>>(
    checkout.data.address ?? {
      fullName: user?.name ?? '',
      phone: user?.phone ?? '',
      line1: '', city: '', state: '', pincode: '',
    },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [payment, setPayment] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [terms, setTerms] = useState(false)
  const [delivery, setDelivery] = useState(checkout.data.delivery ?? { method: 'standard', date: addDays(2), slot: '9:00 AM – 6:00 PM' })
  const [placing, setPlacing] = useState(false)

  const rows = items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId)
      if (!p) return null
      const v = p.variants.find((v) => v.id === i.variantId)
      return { item: i, product: p, variant: v, unit: p.price + (v?.priceDelta ?? 0) }
    })
    .filter(Boolean) as Array<{ item: (typeof items)[0]; product: (typeof products)[0]; variant?: { label: string }; unit: number }>

  // Delivery pricing: cart store is the single source of truth (totals reflect the synced method).

  if (rows.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <EmptyState
            icon={ShoppingBag}
            title="Nothing to check out"
            subtitle="Your cart is empty — add a gift or two first."
            action={<Link to="/shop" className="btn-primary btn-md">Explore gifts</Link>}
          />
        </div>
      </PageTransition>
    )
  }

  const validateAddress = () => {
    const e: Record<string, string> = {}
    if (!form.fullName?.trim()) e.fullName = 'Full name is required'
    if (!isValidPhone(form.phone ?? '')) e.phone = 'Enter a valid 10-digit mobile number'
    if (!form.line1?.trim()) e.line1 = 'Address is required'
    if (!form.city?.trim()) e.city = 'City is required'
    if (!form.state?.trim()) e.state = 'State is required'
    if (!isValidPincode(form.pincode ?? '')) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const saveAndNext = () => {
    if (!validateAddress()) return
    checkout.patch({ address: form as Address })
    checkout.setStep(2)
  }

  const placeFinalOrder = () => {
    if (!terms) {
      toast.error('Please accept the terms', 'A tiny checkbox with big feelings.')
      return
    }
    setPlacing(true)
    const finalTotals = { ...totals }
    const address = form as Address
    const labels: Record<PaymentMethod, string> = {
      upi: `UPI · ${upiId || 'demo@upi'} (simulated)`,
      card: 'Card ····4242 (simulated)',
      cod: 'Cash on Delivery',
      wallet: 'Wallet (simulated)',
    }
    setTimeout(() => {
      const order: Order = {
        id: uid('VLT').toUpperCase().replace('-', '-'),
        date: new Date().toISOString(),
        customerName: address.fullName,
        customerEmail: user?.email ?? 'guest@velvette.shop',
        items: rows.map(({ item, product, variant, unit }) => ({
          productId: product.id,
          name: product.name,
          image: product.images[0],
          variantLabel: variant?.label,
          qty: item.qty,
          price: unit,
        })),
        address,
        delivery: { method: delivery.method === 'same-day' ? 'Same-Day Delivery' : delivery.method === 'scheduled' ? 'Scheduled Delivery' : 'Standard Delivery', date: delivery.date, slot: delivery.slot },
        payment: { method: payment, label: labels[payment] },
        pricing: { subtotal: finalTotals.subtotal, discount: finalTotals.discount, delivery: finalTotals.delivery, total: finalTotals.total, couponCode: useCart.getState().coupon?.code },
        status: 'Order Placed',
        giftNote: rows.find((r) => r.item.giftNote)?.item.giftNote,
      }
      placeOrder(order)
      checkout.saveAddress({ ...address, id: address.id ?? newAddressId(), label: address.label ?? 'Home' })
      checkout.reset()
      clear()
      setPlacing(false)
      navigate(`/order-success/${order.id}`)
    }, 900)
  }

  const inputField = (name: keyof Address, label: string, opts?: { placeholder?: string; type?: string }) => (
    <div>
      <label className="label" htmlFor={`ck-${name}`}>{label}</label>
      <input
        id={`ck-${name}`}
        className={`input ${errors[name] ? 'border-rose-400' : ''}`}
        placeholder={opts?.placeholder}
        type={opts?.type}
        value={(form[name] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  )

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <h1 className="heading-lg text-plum-900">Checkout</h1>

        {/* stepper */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => {
            const n = i + 1
            const step = checkout.step
            const done = step > n
            const active = step === n
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${active ? 'bg-rose-600 text-white shadow-soft' : done ? 'bg-mint/15 text-mint-deep' : 'bg-white text-plum-300'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white/25' : done ? 'bg-mint-deep text-white' : 'bg-plum-100'}`}>
                    {done ? <Check size={11} /> : n}
                  </span>
                  {s}
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="text-plum-300" />}
              </div>
            )
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="card p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: address */}
              {checkout.step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-plum-900">
                    <MapPin size={19} className="text-rose-600" /> Delivery address
                  </h2>
                  {checkout.savedAddresses.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-plum-400">Saved addresses</p>
                      {checkout.savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setForm({ ...a })}
                          className={`w-full rounded-2xl border p-3 text-left transition ${form.line1 === a.line1 ? 'border-rose-400 bg-rose-50' : 'border-plum-100 hover:border-rose-200'}`}
                        >
                          <p className="text-sm font-bold text-plum-900">{a.fullName} · {a.label}</p>
                          <p className="text-xs text-plum-500">{a.line1}, {a.city} {a.pincode}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {inputField('fullName', 'Full name', { placeholder: 'Aarav Mehta' })}
                    {inputField('phone', 'Phone', { placeholder: '98765 43210', type: 'tel' })}
                    <div className="sm:col-span-2">{inputField('line1', 'Address', { placeholder: 'Flat, street, area' })}</div>
                    {inputField('landmark', 'Landmark (optional)')}
                    {inputField('city', 'City')}
                    {inputField('state', 'State')}
                    {inputField('pincode', 'Pincode', { placeholder: '400001' })}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={saveAndNext} className="btn-primary btn-lg">
                      Continue to delivery <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: delivery */}
              {checkout.step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-plum-900">
                    <Truck size={19} className="text-rose-600" /> Delivery options
                  </h2>
                  <div className="mt-5 space-y-3">
                    {([
                      { id: 'standard', title: 'Standard Delivery', sub: '2–4 days · Free above ₹999' },
                      { id: 'same-day', title: 'Same-Day Delivery', sub: 'Today, order before 6 PM' },
                      { id: 'scheduled', title: 'Scheduled Delivery', sub: 'Pick a date & slot for a surprise' },
                    ] as const).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          const next = { ...delivery, method: o.id as typeof delivery.method }
                          if (o.id === 'same-day') next.date = addDays(0)
                          if (o.id === 'scheduled') next.date = addDays(3)
                          setDelivery(next)
                          setCartDeliveryMethod(o.id)
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${delivery.method === o.id ? 'border-rose-500 bg-rose-50/60' : 'border-plum-100 hover:border-rose-200'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${delivery.method === o.id ? 'border-rose-600' : 'border-plum-300'}`}>
                            {delivery.method === o.id && <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />}
                          </span>
                          <span>
                            <span className="block text-sm font-bold text-plum-900">{o.title}</span>
                            <span className="block text-xs text-plum-400">{o.sub}</span>
                          </span>
                        </span>
                        <span className={`text-sm font-bold ${deliveryFeeFor(o.id, totals.subtotal) === 0 ? 'text-mint-deep' : 'text-plum-800'}`}>
                          {deliveryFeeFor(o.id, totals.subtotal) === 0 ? 'Free' : `+${money(deliveryFeeFor(o.id, totals.subtotal))}`}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="ck-date">Delivery date</label>
                      <input
                        id="ck-date"
                        type="date"
                        className="input"
                        value={delivery.date.slice(0, 10)}
                        min={addDays(0).slice(0, 10)}
                        onChange={(e) => setDelivery((d) => ({ ...d, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="ck-slot">Time slot</label>
                      <select id="ck-slot" className="input" value={delivery.slot} onChange={(e) => setDelivery((d) => ({ ...d, slot: e.target.value }))}>
                        {['9:00 AM – 12:00 PM', '12:00 PM – 3:00 PM', '3:00 PM – 6:00 PM', '6:00 PM – 9:00 PM'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-plum-400">
                    <CalendarClock size={13} /> Delivery dates & slots are demo selections.
                  </p>

                  <div className="mt-6 flex justify-between">
                    <button onClick={() => checkout.setStep(1)} className="btn-ghost btn-md"><ChevronLeft size={15} /> Back</button>
                    <button onClick={() => checkout.setStep(3)} className="btn-primary btn-lg">Continue to payment <ChevronRight size={16} /></button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: payment */}
              {checkout.step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-plum-900">
                    <CreditCard size={19} className="text-rose-600" /> Payment method
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-gold-deep">Simulated payment — no real money moves in this demo.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      { id: 'upi', icon: Smartphone, title: 'UPI', sub: 'GPay, PhonePe, Paytm' },
                      { id: 'card', icon: CreditCard, title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                      { id: 'cod', icon: Banknote, title: 'Cash on Delivery', sub: 'Pay when it arrives' },
                      { id: 'wallet', icon: Wallet, title: 'Wallet', sub: 'Velvette wallet balance' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayment(m.id as PaymentMethod)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${payment === m.id ? 'border-rose-500 bg-rose-50/60' : 'border-plum-100 hover:border-rose-200'}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${payment === m.id ? 'bg-rose-600 text-white' : 'bg-plum-100 text-plum-600'}`}>
                          <m.icon size={18} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-plum-900">{m.title}</span>
                          <span className="block text-xs text-plum-400">{m.sub}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {payment === 'upi' && (
                    <div className="mt-4">
                      <label className="label" htmlFor="ck-upi">UPI ID (demo)</label>
                      <input id="ck-upi" className="input" placeholder="name@okbank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    </div>
                  )}
                  {payment === 'card' && (
                    <div className="mt-4 rounded-2xl border border-dashed border-plum-200 bg-plum-50/50 p-4 text-xs text-plum-500">
                      In this demo, card details are never collected — checkout continues with a masked demo card.
                    </div>
                  )}
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => checkout.setStep(2)} className="btn-ghost btn-md"><ChevronLeft size={15} /> Back</button>
                    <button onClick={() => checkout.setStep(4)} className="btn-primary btn-lg">Review order <ChevronRight size={16} /></button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: review */}
              {checkout.step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-plum-900">
                    <ShoppingBag size={19} className="text-rose-600" /> Review & place order
                  </h2>

                  <div className="mt-5 space-y-3">
                    {rows.map(({ item, product, variant, unit }) => (
                      <div key={`${item.productId}-${item.variantId ?? ''}`} className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                          <SmartImage src={product.images[0]} alt="" className="h-full w-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-plum-900">{product.name}</p>
                          <p className="text-xs text-plum-400">{variant?.label} · Qty {item.qty}</p>
                        </div>
                        <span className="text-sm font-bold text-plum-900">{money(unit * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl bg-plum-50/60 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-plum-400">Deliver to</p>
                      <p className="mt-1 font-semibold text-plum-900">{form.fullName}</p>
                      <p className="text-plum-500">{form.line1}, {form.city}, {form.state} {form.pincode}</p>
                      <p className="text-plum-500">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-plum-400">Delivery & payment</p>
                      <p className="mt-1 font-semibold text-plum-900 capitalize">{delivery.method} · {delivery.slot}</p>
                      <p className="text-plum-500">{delivery.date.slice(0, 10)}</p>
                      <p className="text-plum-500 capitalize">{payment} · simulated</p>
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-plum-600">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-plum-300 accent-rose-600" />
                    I understand this is a <strong>demo store</strong> and agree to the demo <Link to="/terms" className="font-semibold text-rose-600 underline">Terms</Link>.
                  </label>

                  <div className="mt-6 flex flex-wrap justify-between gap-3">
                    <button onClick={() => checkout.setStep(3)} className="btn-ghost btn-md"><ChevronLeft size={15} /> Back</button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={placeFinalOrder}
                      disabled={placing}
                      className="btn-primary btn-lg min-w-[220px]"
                    >
                      {placing ? (
                        <span className="flex items-center gap-2"><Lock size={15} /> Placing order…</span>
                      ) : (
                        <>Place demo order · {money(totals.total)}</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-plum-900">Summary</h2>
              <p className="mt-1 text-xs text-plum-400">{rows.length} item{rows.length === 1 ? '' : 's'}</p>
              <div className="mt-4 max-h-44 space-y-2.5 overflow-y-auto pr-1">
                {rows.map(({ item, product, unit }) => (
                  <div key={item.productId + (item.variantId ?? '')} className="flex items-center gap-2.5">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                      <SmartImage src={product.images[0]} alt="" className="h-full w-full" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-plum-700">{product.name}</span>
                    <span className="text-xs font-bold">{money(unit * item.qty)}</span>
                  </div>
                ))}
              </div>
              <dl className="mt-4 space-y-2 border-t border-dashed border-plum-200 pt-4 text-sm">
                <div className="flex justify-between text-plum-600"><dt>Subtotal</dt><dd className="font-semibold text-plum-900">{money(totals.subtotal)}</dd></div>
                {totals.discount > 0 && <div className="flex justify-between text-mint-deep"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
                <div className="flex justify-between text-plum-600"><dt>Delivery</dt><dd className="font-semibold">{totals.delivery === 0 ? 'FREE' : money(totals.delivery)}</dd></div>
                <div className="flex justify-between border-t border-plum-100 pt-2 text-base font-bold text-plum-900"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}
