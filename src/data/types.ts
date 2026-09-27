export type CategorySlug =
  | 'flowers' | 'bouquets' | 'cakes' | 'chocolates' | 'plants' | 'hampers'
  | 'personalized' | 'birthday' | 'anniversary' | 'wedding' | 'corporate'
  | 'same-day' | 'new-arrivals' | 'best-sellers' | 'combos'

export interface Category {
  slug: CategorySlug
  name: string
  tagline: string
  description: string
  image: string
  icon?: string
  featured?: boolean
  animation: 'bouquet' | 'giftbox' | 'cake' | 'personalize' | 'plant' | 'sparkle' | 'heart' | 'calendar' | 'star' | 'combo'
  subcategories: string[]
}

export interface ProductVariant {
  id: string
  label: string
  priceDelta: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: CategorySlug
  subcategory: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  images: string[]
  variants: ProductVariant[]
  stock: number
  tags: string[]
  occasions: string[]
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  sameDay?: boolean
  color?: string
  highlights: string[]
  createdAt: string
}

export interface CartItem {
  productId: string
  variantId?: string
  qty: number
  giftNote?: string
}

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  landmark?: string
  city: string
  state: string
  pincode: string
}

export type OrderStatus = 'Order Placed' | 'Confirmed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'

export interface OrderItem {
  productId: string
  name: string
  image: string
  variantLabel?: string
  qty: number
  price: number
}

export interface Order {
  id: string
  date: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  address: Address
  delivery: { method: string; date: string; slot: string }
  payment: { method: string; label: string }
  pricing: { subtotal: number; discount: number; delivery: number; total: number; couponCode?: string }
  status: OrderStatus
  giftNote?: string
}

export interface DemoUser {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  joinedAt: string
  role: 'customer' | 'admin'
}

export interface Coupon {
  code: string
  type: 'percent' | 'flat'
  value: number
  minOrder: number
  expiry: string
  active: boolean
  description: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  cta: string
  image: string
  link: string
  active: boolean
  order: number
  tone: 'rose' | 'plum' | 'gold' | 'mint' | 'blush'
}

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  text: string
  date: string
  approved: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  status: 'Active' | 'Blocked'
  city: string
  orderCount: number
  totalValue: number
}

export type DeliveryMethod = 'standard' | 'same-day' | 'scheduled'

export interface DeliverySelection {
  method: DeliveryMethod
  date: string
  slot: string
}

export type PaymentMethod = 'upi' | 'card' | 'cod' | 'wallet'

export interface CheckoutState {
  address: Address
  delivery: DeliverySelection
  payment: PaymentMethod
  upiId?: string
  giftNote?: string
  terms: boolean
}
