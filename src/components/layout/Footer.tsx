import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send, Flower2 } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES } from '../../data/categories'
import { toast } from '../../store/ui'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error('Hmm, that email looks off', 'Check the spelling and try again.')
      return
    }
    setDone(true)
    toast.success('You are on the list!', 'Demo subscription — no emails will actually be sent.')
  }

  return (
    <footer className="border-t border-plum-100 bg-plum-900 text-cream">
      {/* newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 md:flex-row">
          <div>
            <h3 className="font-display text-2xl font-semibold">Gifts worth writing home about</h3>
            <p className="mt-1 text-sm text-cream/70">Occasion ideas, early access & 10% off your first demo order.</p>
          </div>
          {done ? (
            <p className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-gold-light">
              <Flower2 size={16} /> Welcome to the Velvette circle ✿
            </p>
          ) : (
            <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-gold"
              />
              <button type="submit" className="btn-gold btn-md flex-shrink-0" aria-label="Subscribe to newsletter">
                <Send size={15} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 font-display text-lg font-bold text-white">V</span>
            <span className="font-display text-xl font-bold">Velvette</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            A premium gifting house for hand-tied flowers, artisan cakes and keepsakes — delivering feelings since 2025 (demo).
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Youtube, label: 'YouTube' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={`Velvette on ${label} (demo link)`}
                onClick={() => toast.info('Demo link', 'Social links are decorative in this demo.')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream/80 transition hover:bg-rose-600 hover:text-white"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4 text-gold-light">Shop</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="transition hover:text-gold-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-gold-light">Company</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><Link to="/about" className="transition hover:text-gold-light">About Velvette</Link></li>
            <li><Link to="/privacy" className="transition hover:text-gold-light">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition hover:text-gold-light">Terms & Conditions</Link></li>
            <li><Link to="/faq" className="transition hover:text-gold-light">FAQ</Link></li>
            <li><Link to="/admin/login" className="transition hover:text-gold-light">Store Admin</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-gold-light">Support</p>
          <ul className="space-y-3 text-sm text-cream/75">
            <li className="flex items-center gap-2.5"><Phone size={15} className="text-gold-light" /> 1800-VELVETTE (demo)</li>
            <li className="flex items-center gap-2.5"><Mail size={15} className="text-gold-light" /> care@velvette.shop</li>
            <li className="flex items-center gap-2.5"><MapPin size={15} className="text-gold-light" /> 12 Rose Lane, Mumbai (demo)</li>
          </ul>
          <p className="mt-4 rounded-2xl bg-white/5 p-3 text-xs leading-relaxed text-cream/60">
            This is a frontend demo store. No real payments, orders or deliveries are processed.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/50 md:flex-row">
          <p>© 2026 Velvette Gifting (demo). An original concept store — not affiliated with any real retailer.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Flower2 size={12} className="text-rose-400" /> for gift lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
