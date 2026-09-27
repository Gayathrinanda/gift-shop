import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMotionSafe } from '../../lib/motion'

export default function FadeIn({
  children,
  delay = 0,
  y = 22,
  className = '',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const motionSafe = useMotionSafe()
  if (!motionSafe) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
