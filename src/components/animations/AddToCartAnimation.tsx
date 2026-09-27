import { useUi } from '../../store/ui'
import { useMotionSafe } from '../../lib/motion'
import { toast } from '../../store/ui'
import type { MouseEvent } from 'react'

/** Fires the flying-cart burst at the click point and shows a confirmation toast. */
export function useAddToCartFeedback() {
  const fireBurst = useUi((s) => s.fireBurst)
  const motionSafe = useMotionSafe()

  return (e?: MouseEvent, name?: string) => {
    if (motionSafe && e) {
      fireBurst(e.clientX, e.clientY, 'cart')
    }
    toast.success('Added to cart', name ? `${name} is waiting in your cart.` : undefined)
  }
}
