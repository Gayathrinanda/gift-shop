import type { MouseEvent } from 'react'
import { useUi } from '../../store/ui'
import { useMotionSafe } from '../../lib/motion'
import { toast } from '../../store/ui'

/** Heart burst at the pointer + toast feedback for wishlist actions. */
export function useWishlistFeedback() {
  const fireBurst = useUi((s) => s.fireBurst)
  const motionSafe = useMotionSafe()

  return (e: MouseEvent | undefined, added: boolean, name?: string) => {
    if (motionSafe && e) fireBurst(e.clientX, e.clientY, 'heart')
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist', name ? `${name} · ${added ? 'saved' : 'unsaved'}` : undefined)
  }
}
