import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Heart } from 'lucide-react'
import { useUi } from '../../store/ui'
import { useMotionSafe } from '../../lib/motion'

/** Renders a one-shot icon burst wherever a cart/heart action happened. */
export default function BurstLayer() {
  const burst = useUi((s) => s.burst)
  const motionSafe = useMotionSafe()
  if (!motionSafe) return null

  return (
    <AnimatePresence>
      {burst && (
        <motion.div
          key={burst.id}
          className="pointer-events-none fixed z-[95]"
          style={{ left: burst.x, top: burst.y }}
          initial={{ opacity: 1 }}
        >
          {burst.kind === 'cart' ? (
            <motion.div initial={{ scale: 0.4, y: 0, opacity: 1 }} animate={{ scale: 1.6, y: -26, opacity: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
              <ShoppingBag size={22} className="text-rose-600" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.8, y: -30, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <Heart size={24} className="text-rose-500" fill="currentColor" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
