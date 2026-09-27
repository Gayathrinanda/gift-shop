import { Star } from 'lucide-react'

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(value) ? 'fill-gold text-gold' : 'fill-plum-100 text-plum-100'
          }
        />
      ))}
    </span>
  )
}

export default function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-plum-500">
      <Stars value={value} size={size} />
      <span className="font-semibold text-plum-700">{value.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  )
}
