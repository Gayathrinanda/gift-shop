import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useToasts } from '../../store/ui'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }
const TONES = {
  success: 'border-mint-deep/30 bg-white',
  error: 'border-rose-300 bg-white',
  info: 'border-plum-200 bg-white',
}

export default function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift ${TONES[t.kind]}`}
            >
              <Icon size={19} className={t.kind === 'success' ? 'text-mint-deep' : t.kind === 'error' ? 'text-rose-600' : 'text-gold'} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-plum-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-plum-500">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-auto rounded-full p-1 text-plum-300 transition hover:bg-plum-100 hover:text-plum-600"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
