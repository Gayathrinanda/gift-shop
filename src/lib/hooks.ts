import { useEffect, useRef, useState } from 'react'

/** True when the user prefers reduced motion — drives the animation system. */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    setMatches(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [query])
  return matches
}

/** Locks body scrolling while a modal / drawer is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

export function useEscapeKey(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [handler, active])
}

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** True for the first paint of a mount — lets heavy entrance animations run once per session. */
export function useIsFirstSessionVisit(key: string): boolean {
  const seen = useRef(false)
  if (seen.current === false) {
    seen.current = sessionStorage.getItem(`velvette-anim-${key}`) !== '1'
  }
  return seen.current
}

export function markSessionVisit(key: string) {
  try {
    sessionStorage.setItem(`velvette-anim-${key}`, '1')
  } catch {
    /* private mode */
  }
}
