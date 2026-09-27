import type { Coupon, Banner, Review, Customer, DemoUser, Order, OrderItem, Address } from './types'
import { addDays } from '../lib/utils'
import { PRODUCT_MAP } from './products'

export const COUPONS: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 499, expiry: '2027-03-31', active: true, description: '10% off your first gift' },
  { code: 'GIFT20', type: 'percent', value: 20, minOrder: 1499, expiry: '2026-12-31', active: true, description: '20% off orders ₹1499+' },
  { code: 'FIRSTORDER', type: 'flat', value: 150, minOrder: 799, expiry: '2026-12-31', active: true, description: 'Flat ₹150 off orders ₹799+' },
]

export const BANNERS: Banner[] = [
  {
    id: 'bnr-1', title: 'Same-Day Magic',
    subtitle: 'Order by 6 pm, gift them today — flowers, cakes & more on express bikes.',
    cta: 'Shop Same-Day', link: '/category/same-day', image: '', active: true, order: 1, tone: 'rose',
  },
  {
    id: 'bnr-2', title: 'The Anniversary Atelier',
    subtitle: 'Preserved roses, star maps & keepsakes that mark every year of us.',
    cta: 'Explore Anniversary', link: '/category/anniversary', image: '', active: true, order: 2, tone: 'plum',
  },
  {
    id: 'bnr-3', title: 'Velvette Signature Hampers',
    subtitle: 'Gourmet trays, candles and keepsakes — curated like only we can.',
    cta: 'View Hampers', link: '/category/hampers', image: '', active: true, order: 3, tone: 'gold',
  },
  {
    id: 'bnr-4', title: 'Personalized, Perfectly',
    subtitle: 'Star maps, monograms & embroidered everything — made with their name on it.',
    cta: 'Personalize Now', link: '/category/personalized', image: '', active: true, order: 4, tone: 'mint',
  },
]

export const USERS: DemoUser[] = [
  { id: 'usr-1', name: 'Aarav Mehta', email: 'demo@velvette.shop', password: 'demo123', phone: '9820011223', joinedAt: '2025-11-12', role: 'customer' },
  { id: 'usr-2', name: 'Store Admin', email: 'admin@velvette.shop', password: 'admin123', role: 'admin', joinedAt: '2025-01-05' },
  { id: 'usr-3', name: 'Diya Kapoor', email: 'diya@example.com', password: 'diya123', phone: '9812345670', joinedAt: '2026-02-08', role: 'customer' },
]

/** Quick builder for demo orders with real products from the catalog. */
function mkItems(spec: Array<[string, number, string?]>): OrderItem[] {
  return spec.map(([pid, qty, variantLabel]) => {
    const p = PRODUCT_MAP[pid]
    return {
      productId: pid,
      name: p.name,
      image: p.images[0],
      variantLabel,
      qty,
      price: p.price,
    }
  })
}

const addr = (label: string, fullName: string, phone: string, line1: string, city: string, state: string, pincode: string): Address => ({
  id: `adr-${label.toLowerCase()}`, label, fullName, phone, line1, city, state, pincode,
})

export const ORDERS: Order[] = [
  {
    id: 'VLT-88214', date: addDays(-16),
    customerName: 'Aarav Mehta', customerEmail: 'demo@velvette.shop',
    items: mkItems([['vel-001', 1, '20 Roses'], ['vel-011', 1, '500g']]),
    address: addr('Home', 'Aarav Mehta', '9820011223', '402, Sunrise Residency, MG Road', 'Mumbai', 'Maharashtra', '400001'),
    delivery: { method: 'Same-Day Delivery', date: addDays(-16), slot: '6:00 PM – 9:00 PM' },
    payment: { method: 'upi', label: 'UPI · demo@okicici' },
    pricing: { subtotal: 1648, discount: 165, delivery: 0, total: 1483, couponCode: 'WELCOME10' },
    status: 'Delivered',
  },
  {
    id: 'VLT-88097', date: addDays(-9),
    customerName: 'Aarav Mehta', customerEmail: 'demo@velvette.shop',
    items: mkItems([['vel-016', 1, '25 pc']]),
    address: addr('Office', 'Aarav Mehta', '9820011223', '14th Floor, Trident Park, BKC', 'Mumbai', 'Maharashtra', '400051'),
    delivery: { method: 'Standard Delivery', date: addDays(-7), slot: '9:00 AM – 6:00 PM' },
    payment: { method: 'card', label: 'Card ····4242 (demo)' },
    pricing: { subtotal: 1599, discount: 0, delivery: 49, total: 1648 },
    status: 'Out for Delivery',
  },
  {
    id: 'VLT-88156', date: addDays(-5),
    customerName: 'Diya Kapoor', customerEmail: 'diya@example.com',
    items: mkItems([['vel-029', 1, 'A2 Canvas'], ['vel-030', 2]]),
    address: addr('Home', 'Diya Kapoor', '9812345670', 'B-701, Orchid Towers, Indiranagar', 'Bengaluru', 'Karnataka', '560038'),
    delivery: { method: 'Standard Delivery', date: addDays(-2), slot: '9:00 AM – 6:00 PM' },
    payment: { method: 'wallet', label: 'Wallet (demo)' },
    pricing: { subtotal: 2697, discount: 0, delivery: 0, total: 2697 },
    status: 'Processing',
  },
  {
    id: 'VLT-87980', date: addDays(-21),
    customerName: 'Diya Kapoor', customerEmail: 'diya@example.com',
    items: mkItems([['vel-002', 1, '50 Roses']]),
    address: addr('Home', 'Diya Kapoor', '9812345670', 'B-701, Orchid Towers, Indiranagar', 'Bengaluru', 'Karnataka', '560038'),
    delivery: { method: 'Same-Day Delivery', date: addDays(-21), slot: '12:00 PM – 3:00 PM' },
    payment: { method: 'cod', label: 'Cash on Delivery' },
    pricing: { subtotal: 1499, discount: 300, delivery: 0, total: 1199, couponCode: 'GIFT20' },
    status: 'Cancelled',
  },
  {
    id: 'VLT-87812', date: addDays(-28),
    customerName: 'Rohan Shah', customerEmail: 'rohan@example.com',
    items: mkItems([['vel-038', 1, 'Pack of 5'], ['vel-024', 1]]),
    address: addr('Office', 'Rohan Shah', '9900112233', 'Cyber Towers, Level 9, Hitech City', 'Hyderabad', 'Telangana', '500081'),
    delivery: { method: 'Standard Delivery', date: addDays(-25), slot: '9:00 AM – 6:00 PM' },
    payment: { method: 'upi', label: 'UPI · rohan@ybl' },
    pricing: { subtotal: 15299, discount: 1530, delivery: 0, total: 13769, couponCode: 'GIFT20' },
    status: 'Delivered',
  },
  {
    id: 'VLT-87901', date: addDays(-18),
    customerName: 'Sana Fernandes', customerEmail: 'sana@example.com',
    items: mkItems([['vel-020', 1], ['vel-036', 1, 'Heart Box']]),
    address: addr('Home', 'Sana Fernandes', '9765432101', '12, Palm Grove, Candolim', 'Goa', 'Goa', '403519'),
    delivery: { method: 'Scheduled Delivery', date: addDays(-14), slot: '5:00 PM – 8:00 PM' },
    payment: { method: 'card', label: 'Card ····1881 (demo)' },
    pricing: { subtotal: 3698, discount: 0, delivery: 99, total: 3797 },
    status: 'Confirmed',
  },
]

export const CUSTOMERS: Customer[] = [
  { id: 'cst-1', name: 'Aarav Mehta', email: 'demo@velvette.shop', phone: '9820011223', joinedAt: '2025-11-12', status: 'Active', city: 'Mumbai', orderCount: 2, totalValue: 3131 },
  { id: 'cst-2', name: 'Diya Kapoor', email: 'diya@example.com', phone: '9812345670', joinedAt: '2026-02-08', status: 'Active', city: 'Bengaluru', orderCount: 2, totalValue: 3896 },
  { id: 'cst-3', name: 'Rohan Shah', email: 'rohan@example.com', phone: '9900112233', joinedAt: '2025-06-30', status: 'Active', city: 'Hyderabad', orderCount: 1, totalValue: 13769 },
  { id: 'cst-4', name: 'Sana Fernandes', email: 'sana@example.com', phone: '9765432101', joinedAt: '2026-04-19', status: 'Active', city: 'Goa', orderCount: 1, totalValue: 3797 },
  { id: 'cst-5', name: 'Kabir Rao', email: 'kabir@example.com', phone: '9845098450', joinedAt: '2026-05-02', status: 'Blocked', city: 'Pune', orderCount: 3, totalValue: 5920 },
  { id: 'cst-6', name: 'Meera Nair', email: 'meera@example.com', phone: '9810998109', joinedAt: '2026-06-11', status: 'Active', city: 'Kochi', orderCount: 0, totalValue: 0 },
]

export const REVIEWS: Review[] = [
  { id: 'rev-1', productId: 'vel-001', customerName: 'Rhea S.', rating: 5, text: 'The roses arrived still cool from the farm. My wife cried — happy tears. Packing felt like unwrapping a luxury brand.', date: '2026-09-10', approved: true },
  { id: 'rev-2', productId: 'vel-001', customerName: 'Vikram J.', rating: 4, text: 'Beautiful wrap, slightly smaller than the photos but fresh and fragrant.', date: '2026-09-02', approved: true },
  { id: 'rev-3', productId: 'vel-011', customerName: 'Ananya P.', rating: 5, text: 'Best truffle cake in the city. Moist, dark, not too sweet. Ordered twice in a month.', date: '2026-09-14', approved: true },
  { id: 'rev-4', productId: 'vel-011', customerName: 'Farhan M.', rating: 4, text: 'Delivered slightly late but the cake made up for it. The crumb is unreal.', date: '2026-08-30', approved: true },
  { id: 'rev-5', productId: 'vel-016', customerName: 'Nikita R.', rating: 5, text: 'The saffron truffle is dangerous. I finished six before gifting the box.', date: '2026-09-08', approved: true },
  { id: 'rev-6', productId: 'vel-029', customerName: 'Arjun D.', rating: 5, text: 'She recognised the date instantly. The canvas quality is gallery-level.', date: '2026-09-01', approved: true },
  { id: 'rev-7', productId: 'vel-020', customerName: 'Leena K.', rating: 4, text: 'Peace lily arrived healthy with a bloom ready to open. Pot is beautiful stoneware.', date: '2026-08-24', approved: true },
  { id: 'rev-8', productId: 'vel-036', customerName: 'Sameer T.', rating: 5, text: 'Year-old roses and they still look fresh. Anniversary saved.', date: '2026-09-12', approved: false },
  { id: 'rev-9', productId: 'vel-002', customerName: 'Priya V.', rating: 5, text: '50 roses, zero bruises. The satin bow is a nice touch.', date: '2026-09-15', approved: true },
  { id: 'rev-10', productId: 'vel-028', customerName: 'Dev B.', rating: 4, text: 'Etching is crisp. Mug feels premium and heavy.', date: '2026-09-04', approved: true },
]

export const POPULAR_SEARCHES = [
  'Red roses', 'Birthday gifts', 'Anniversary cake', 'Chocolate hamper', 'Personalized gifts', 'Same-day flowers',
]
