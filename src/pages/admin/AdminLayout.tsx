import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users, TicketPercent, Image as ImageIcon,
  Star, BarChart3, Settings, LogOut, Menu, X, Bell, ChevronDown, ExternalLink, LayoutTemplate,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdminAuth } from '../../store/auth'
import { useOrders } from '../../store/orders'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function Guard({ children }: { children: React.ReactNode }) {
  const isAdmin = useAdminAuth((s) => s.isAdmin)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-plum-900/95 p-6 text-cream">
        <div className="max-w-md text-center">
          <Package size={40} className="mx-auto text-gold-light" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-cream/70">Sign in with the demo admin credentials to open the console.</p>
          <Link to="/admin/login" className="btn-gold btn-lg mt-6 inline-flex">Go to admin login</Link>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { isAdmin, adminEmail, adminSignOut } = useAdminAuth()
  const orders = useOrders((s) => s.orders)
  const navigate = useNavigate()

  const newOrders = orders.filter((o) => o.status === 'Order Placed' || o.status === 'Confirmed').length

  if (!isAdmin) {
    return (
      <Guard>
        <Outlet />
      </Guard>
    )
  }

  return (
    <Guard>
      <div className="flex min-h-screen bg-plum-50/60">
        {/* sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-plum-900 text-cream lg:flex">
          <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 font-display text-lg font-bold">M</span>
            <div>
              <p className="font-display font-bold leading-tight">MemoriesCatcher</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">Admin console</p>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Admin">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive ? 'bg-rose-600 text-white shadow-soft' : 'text-cream/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <n.icon size={17} /> {n.label}
                {n.label === 'Orders' && newOrders > 0 && (
                  <span className="ml-auto rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-plum-900">{newOrders}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 p-3">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cream/70 transition hover:bg-white/10">
              <ExternalLink size={16} /> View storefront
            </Link>
            <button
              onClick={() => { adminSignOut(); navigate('/admin/login') }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cream/70 transition hover:bg-rose-600 hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* mobile sidebar */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-plum-900/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-plum-900 text-cream lg:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <p className="font-display font-bold">MemoriesCatcher Admin</p>
                  <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
                </div>
                <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                  {NAV.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${isActive ? 'bg-rose-600 text-white' : 'text-cream/70 hover:bg-white/10'}`
                      }
                    >
                      <n.icon size={17} /> {n.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* main */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-plum-100 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-plum-100 lg:hidden" aria-label="Open admin menu">
                  <Menu size={20} />
                </button>
                <p className="hidden text-sm text-plum-400 md:block">
                  Demo console · changes persist only in this browser
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative rounded-full p-2.5 text-plum-500 hover:bg-plum-100" aria-label="Notifications">
                  <Bell size={18} />
                  {newOrders > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-600" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-plum-100"
                    aria-expanded={profileOpen}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-800 text-xs font-bold text-cream">AD</span>
                    <span className="hidden text-sm font-semibold text-plum-800 md:block">Admin</span>
                    <ChevronDown size={14} className="text-plum-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-plum-100 bg-white p-2 shadow-lift">
                      <p className="px-3 py-2 text-xs text-plum-400">{adminEmail}</p>
                      <Link to="/admin/settings" className="block rounded-xl px-3 py-2 text-sm font-semibold text-plum-700 hover:bg-plum-50">Settings</Link>
                      <button
                        onClick={() => { adminSignOut(); navigate('/admin/login') }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>

          <footer className="border-t border-plum-100 px-6 py-4 text-center text-xs text-plum-300">
            MemoriesCatcher demo admin · frontend-only state, resets when you clear browser storage
          </footer>
        </div>
      </div>
    </Guard>
  )
}
