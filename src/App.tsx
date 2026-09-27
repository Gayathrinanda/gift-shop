import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Toaster from './components/ui/Toaster'
import BurstLayer from './components/animations/BurstLayer'
import QuickViewModal from './components/ui/QuickViewModal'
import Home from './pages/Home'
import Shop from './pages/Shop'
import SearchPage from './pages/SearchPage'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AuthPage from './pages/Auth'
import Account from './pages/Account'
import { AboutPage, PrivacyPage, TermsPage, FaqPage, NotFoundPage } from './pages/StaticPages'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import { AdminProducts, AdminProductForm } from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import { AdminOrders, AdminOrderDetail } from './pages/admin/AdminOrders'
import { AdminCustomers, AdminCoupons, AdminBanners, AdminReviews, AdminAnalytics, AdminSettings } from './pages/admin/AdminMisc'

function ScrollToTop() {
  window.setTimeout(() => window.scrollTo(0, 0), 0)
  return null
}

function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <BurstLayer />
      <Toaster />
      <QuickViewModal />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ——— Storefront ——— */}
          <Route path="/" element={<StoreShell><Home /></StoreShell>} />
          <Route path="/shop" element={<StoreShell><Shop /></StoreShell>} />
          <Route path="/category/:categorySlug" element={<StoreShell><Shop /></StoreShell>} />
          <Route path="/search" element={<StoreShell><SearchPage /></StoreShell>} />
          <Route path="/product/:productId" element={<StoreShell><ProductDetail /></StoreShell>} />
          <Route path="/cart" element={<StoreShell><CartPage /></StoreShell>} />
          <Route path="/wishlist" element={<StoreShell><WishlistPage /></StoreShell>} />
          <Route path="/checkout" element={<StoreShell><Checkout /></StoreShell>} />
          <Route path="/order-success/:orderId" element={<StoreShell><OrderSuccess /></StoreShell>} />
          <Route path="/signin" element={<StoreShell><AuthPage mode="signin" /></StoreShell>} />
          <Route path="/signup" element={<StoreShell><AuthPage mode="signup" /></StoreShell>} />
          <Route path="/forgot-password" element={<StoreShell><AuthPage mode="forgot" /></StoreShell>} />
          <Route path="/account/*" element={<StoreShell><Account /></StoreShell>} />
          <Route path="/about" element={<StoreShell><AboutPage /></StoreShell>} />
          <Route path="/privacy" element={<StoreShell><PrivacyPage /></StoreShell>} />
          <Route path="/terms" element={<StoreShell><TermsPage /></StoreShell>} />
          <Route path="/faq" element={<StoreShell><FaqPage /></StoreShell>} />

          {/* ——— Admin ——— */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:productId/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<StoreShell><NotFoundPage /></StoreShell>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
