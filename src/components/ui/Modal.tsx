import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useEscapeKey, useScrollLock } from '../../lib/hooks'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, children, wide }: Props) {
  useScrollLock(open)
  useEscapeKey(onClose, open)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 30)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-plum-900/45 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`relative z-10 w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[88vh] overflow-y-auto rounded-3xl bg-white shadow-lift focus:outline-none`}
          >
            {title && (
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-plum-100 bg-white/95 px-6 py-4 backdrop-blur">
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <button onClick={onClose} aria-label="Close dialog" className="rounded-full p-1.5 text-plum-400 transition hover:bg-plum-100 hover:text-plum-700">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
