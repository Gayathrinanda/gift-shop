import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import SmartImage from './SmartImage'
import { useEscapeKey } from '../../lib/hooks'

/** Product gallery: thumbnails, swipe, hover-zoom, lightbox. */
export default function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const go = (dir: number) => setIdx((i) => (i + dir + images.length) % images.length)

  useEscapeKey(() => setLightbox(false), lightbox)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!zoom || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    frameRef.current.style.setProperty('--zx', `${x}%`)
    frameRef.current.style.setProperty('--zy', `${y}%`)
  }

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden rounded-3xl bg-plum-50"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setZoom(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            ref={frameRef}
            className="h-full w-full"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={zoom ? { transform: 'scale(1.7)', transformOrigin: 'var(--zx,50%) var(--zy,50%)' } : undefined}
          >
            <SmartImage src={images[idx]} alt={`${name} — image ${idx + 1}`} className="h-full w-full" eager />
          </motion.div>
        </AnimatePresence>

        {/* arrows */}
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-soft backdrop-blur transition hover:bg-white">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-soft backdrop-blur transition hover:bg-white">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* zoom button */}
        <button
          onClick={() => setLightbox(true)}
          aria-label="Open zoom lightbox"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-plum-700 shadow-soft backdrop-blur transition hover:bg-white hover:text-rose-600"
        >
          <ZoomIn size={17} />
        </button>

        {/* swipe */}
        <div
          className="absolute inset-0 md:hidden"
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
            touchStartX.current = null
          }}
        />
      </div>

      {/* thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${i === idx ? 'border-rose-500 shadow-soft' : 'border-transparent opacity-65 hover:opacity-100'}`}
            >
              <SmartImage src={img} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-plum-900/92 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20" aria-label="Close zoom">
              <X size={20} />
            </button>
            <motion.img
              key={idx}
              src={images[idx]}
              alt={`${name} enlarged`}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-lift"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIdx(i)
                    }}
                    aria-label={`Image ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-gold-light' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
