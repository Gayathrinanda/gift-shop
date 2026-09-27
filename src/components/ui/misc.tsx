import { Gift } from 'lucide-react'
import { money } from '../../lib/utils'

export function EmptyState({
  icon: Icon = Gift,
  title,
  subtitle,
  action,
}: {
  icon?: React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-plum-200 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Icon size={30} strokeWidth={1.6} />
      </div>
      <h3 className="font-display text-xl font-semibold text-plum-900">{title}</h3>
      {subtitle && <p className="mt-1.5 max-w-md text-sm text-plum-500">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PriceTag({ price, original, size = 'md' }: { price: number; original?: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-plum-900 ${sizes[size]}`}>{money(price)}</span>
      {original && original > price && (
        <>
          <span className={`text-plum-300 line-through ${size === 'lg' ? 'text-base' : 'text-xs'}`}>{money(original)}</span>
          <span className="text-xs font-bold text-mint-deep">{Math.round(((original - price) / original) * 100)}% off</span>
        </>
      )}
    </span>
  )
}

export function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3.4] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="skeleton h-3 w-1/3 rounded-full" />
      </div>
      <div className="p-4 pt-0" />
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
