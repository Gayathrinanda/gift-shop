import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { useMotionSafe } from '../../lib/motion'

/** Confetti burst used sparingly: order success + occasion gift-box reveals. */
export default function ConfettiEffect({ active, count = 26 }: { active: boolean; count?: number }) {
  const motionSafe = useMotionSafe()
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -(Math.random() * 260 + 60),
        rotate: Math.random() * 720 - 360,
        scale: 0.5 + Math.random() * 0.9,
        delay: Math.random() * 0.25,
        color: ['#b4123f', '#c98a2d', '#e87494', '#7da98f', '#e8b96a'][i % 5],
        w: 5 + Math.random() * 5,
        h: 9 + Math.random() * 9,
      })),
    [count, active], // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (!motionSafe) return null

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {pieces.map((p) => (
            <motion.span
              key={`${active}-${p.id}`}
              className="absolute left-1/2 top-1/2 block"
              style={{ background: p.color, width: p.w, height: p.h }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, borderRadius: 2 }}
              animate={{ x: p.x, y: [0, p.y, p.y + 320], opacity: [1, 1, 0], rotate: p.rotate }}
              transition={{ duration: 1.6, delay: p.delay, ease: [0.15, 0.6, 0.35, 1] }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
