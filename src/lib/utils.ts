export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function money(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

export function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9][0-9]{9}$/.test(phone.replace(/\s/g, ''))
}

export function discountPct(price: number, original?: number): number | null {
  if (!original || original <= price) return null
  return Math.round(((original - price) / original) * 100)
}

export function pluralize(n: number, one: string, many?: string) {
  return `${n} ${n === 1 ? one : many ?? one + 's'}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function seedRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
