import type { HTMLMotionProps } from 'framer-motion'
import { motion } from 'framer-motion'
import { useReducedMotionPref } from './hooks'

/** Shared motion presets — single source of truth for premium motion language. */
export const easeGlide: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const easeSnappy: [number, number, number, number] = [0.5, 0, 0.15, 1]

export const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: easeGlide },
} satisfies HTMLMotionProps<'div'>

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeGlide } },
}

export const popIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: easeGlide },
}

export const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: easeGlide },
}

export function useMotionSafe() {
  const reduced = useReducedMotionPref()
  return !reduced
}

/** Re-export motion for reduced-motion aware components. */
export { motion }
