import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface Props {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

/** Lazy-loaded image with shimmer skeleton and elegant fallback. */
export default function SmartImage({ src, alt, className = '', eager }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !failed && <div className="absolute inset-0 skeleton" />}
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-plum-100/60 text-plum-300">
          <ImageOff size={28} strokeWidth={1.5} />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        />
      )}
    </div>
  )
}
