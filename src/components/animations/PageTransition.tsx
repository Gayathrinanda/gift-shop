import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMotionSafe } from '../../lib/motion'

/** Subtle page transition — quick fade/slide that never blocks navigation. */
export default function PageTransition({ children }: { children: ReactNode }) {
  const motionSafe = useMotionSafe()
  if (!motionSafe) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
