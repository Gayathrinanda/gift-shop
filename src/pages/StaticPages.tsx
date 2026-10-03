import { Link } from 'react-router-dom'
import { Flower2, ShieldCheck, RefreshCcw, Truck, ChevronDown, Compass } from 'lucide-react'
import { useState } from 'react'
import PageTransition from '../components/animations/PageTransition'
import { EmptyState } from '../components/ui/misc'

function Shell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="eyebrow text-rose-600">MemoriesCatcher</p>
        <h1 className="heading-lg mt-1 text-plum-900">{title}</h1>
        <p className="mt-2 text-sm text-plum-500">{sub}</p>
        <div className="prose-velvette mt-8 space-y-6 text-sm leading-relaxed text-plum-600">{children}</div>
      </div>
    </PageTransition>
  )
}

export function AboutPage() {
  return (
    <Shell title="About MemoriesCatcher" sub="An original concept gifting house — built as a frontend demo with love and no backend.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-start gap-4 p-5">
          <Flower2 size={22} className="mt-0.5 flex-shrink-0 text-rose-600" />
          <div>
            <h3 className="font-display text-lg font-bold text-plum-900">Our story</h3>
            <p className="mt-1.5">
              MemoriesCatcher began as a florist’s New Year resolution: never let a gift feel like an errand. We arrange
              bouquets at dawn, source cakes from bakeries we personally annoy, and wrap every hamper like it is
              going to someone we owe an apology to.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <ShieldCheck size={22} className="mt-0.5 flex-shrink-0 text-mint-deep" />
          <div>
            <h3 className="font-display text-lg font-bold text-plum-900">The MemoriesCatcher promise</h3>
            <p className="mt-1.5">
              Fresh-cut flowers with a 2-day vase-life guarantee, cakes baked the morning they ship, and a human
              (demo) on the other end of every order.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <RefreshCcw size={22} className="mt-0.5 flex-shrink-0 text-gold" />
          <div>
            <h3 className="font-display text-lg font-bold text-plum-900">Freshness first</h3>
            <p className="mt-1.5">
              If a bouquet arrives tired, we replace it. If a cake arrives damaged, we re-bake it. Demo policies,
              sincerely meant.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-5">
          <Truck size={22} className="mt-0.5 flex-shrink-0 text-rose-600" />
          <div>
            <h3 className="font-display text-lg font-bold text-plum-900">Delivery obsession</h3>
            <p className="mt-1.5">
              Same-day express lanes in metros, scheduled surprise deliveries, and photo-proof on every hand-off.
            </p>
          </div>
        </div>
      </div>
      <p className="rounded-2xl bg-plum-50 p-4 text-xs text-plum-500">
        MemoriesCatcher is a fictional demo brand created for this frontend project. It is not affiliated with any real
        retailer; all products, prices and reviews are demo data.
      </p>
    </Shell>
  )
}

export function PrivacyPage() {
  return (
    <Shell title="Privacy Policy (Demo)" sub="The short, honest version: everything stays in your browser.">
      <p><strong>Last updated:</strong> September 2026 · This is a demo document for a demo store.</p>
      <h3 className="font-display text-lg font-bold text-plum-900">What we store</h3>
      <p>
        Your cart, wishlist, demo session, addresses and demo orders are stored in your browser’s localStorage.
        Nothing is transmitted to any server, because there is no server.
      </p>
      <h3 className="font-display text-lg font-bold text-plum-900">What we never collect</h3>
      <p>Real payment data. Real identity documents. Anything a court could subpoena, frankly.</p>
      <h3 className="font-display text-lg font-bold text-plum-900">Third parties</h3>
      <p>
        Demo product images are loaded from Unsplash. We do not set tracking cookies, ad pixels, or mood-ring
        sensors.
      </p>
    </Shell>
  )
}

export function TermsPage() {
  return (
    <Shell title="Terms & Conditions (Demo)" sub="Ground rules for pretending to shop with us.">
      <p><strong>Effective:</strong> September 2026 · Demo terms for a demo store.</p>
      <h3 className="font-display text-lg font-bold text-plum-900">1. The store is a demo</h3>
      <p>
        MemoriesCatcher is a frontend demonstration. No payments are processed, no orders are fulfilled, and no flowers
        will arrive at your door (sadly).
      </p>
      <h3 className="font-display text-lg font-bold text-plum-900">2. Demo accounts</h3>
      <p>Accounts live in localStorage. Do not use a real password here. Seriously — it is stored in plain text.</p>
      <h3 className="font-display text-lg font-bold text-plum-900">3. Coupons</h3>
      <p>WELCOME10, GIFT20 and FIRSTORDER are demo codes that adjust demo totals. They have no cash value.</p>
      <h3 className="font-display text-lg font-bold text-plum-900">4. Liability</h3>
      <p>None. Have fun, gift responsibly, water the plants.</p>
    </Shell>
  )
}

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)
  const faqs = [
    { q: 'Is this a real store?', a: 'No — MemoriesCatcher is a fully functional frontend demo. Cart, checkout and orders all work against demo data in your browser.' },
    { q: 'How do demo coupons work?', a: 'Apply WELCOME10, GIFT20 or FIRSTORDER in the cart. They validate against minimum order values just like a real coupon engine (minus the money).' },
    { q: 'Where do the product images come from?', a: 'Demo photography is served from Unsplash. If an image ever fails to load, you will see a graceful placeholder instead of a broken page.' },
    { q: 'Will my cart survive a refresh?', a: 'Yes. Cart, wishlist, demo session and orders persist in localStorage and rehydrate on load.' },
    { q: 'Can I manage the store?', a: 'Yes! Sign in at /admin/login with admin@velvette.shop / admin123 to open the demo admin console — products, coupons, banners, orders and more.' },
    { q: 'Do the category animations play every time?', a: 'Only once per category per browser session, and you can always skip them. Users with reduced-motion preferences never see them.' },
  ]
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="eyebrow text-rose-600">Help centre</p>
        <h1 className="heading-lg mt-1 text-plum-900">Frequently asked questions</h1>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-plum-900">{f.q}</span>
                <ChevronDown size={17} className={`flex-shrink-0 text-plum-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="border-t border-plum-100 px-5 py-4 text-sm text-plum-500">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Compass size={44} strokeWidth={1.5} />
        </div>
        <h1 className="heading-xl mt-6 text-plum-900">404</h1>
        <p className="mt-2 text-plum-500">
          This page seems to have been gifted to someone else. Let’s get you back to the good stuff.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary btn-lg">Back home</Link>
          <Link to="/shop" className="btn-outline btn-lg">Browse gifts</Link>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-plum-300">Error code: GIFT-NOT-FOUND</p>
      </div>
    </PageTransition>
  )
}
