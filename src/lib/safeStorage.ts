export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

export function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
