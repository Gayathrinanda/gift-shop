import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DemoUser } from '../data/types'
import { USERS } from '../data/demo'
import { uid } from '../lib/utils'

interface AuthState {
  user: DemoUser | null
  signIn: (email: string, password: string) => { ok: boolean; message: string; role?: 'customer' | 'admin' }
  signUp: (name: string, email: string, password: string) => { ok: boolean; message: string }
  signOut: () => void
  updateProfile: (patch: Partial<DemoUser>) => void
}

interface StoredUser extends DemoUser {
  password: string
}

function userStore(): StoredUser[] {
  try {
    const raw = localStorage.getItem('velvette-users-v1')
    if (raw) return JSON.parse(raw) as StoredUser[]
  } catch { /* ignore */ }
  localStorage.setItem('velvette-users-v1', JSON.stringify(USERS))
  return [...USERS]
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      signIn: (email, password) => {
        const users = userStore()
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        if (!found) return { ok: false, message: 'No demo account found with that email. Try demo@velvette.shop / demo123.' }
        if (found.password !== password) return { ok: false, message: 'Incorrect password for this demo account.' }
        set({ user: found })
        return { ok: true, message: `Welcome back, ${found.name.split(' ')[0]}!`, role: found.role }
      },
      signUp: (name, email, password) => {
        const users = userStore()
        if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          return { ok: false, message: 'A demo account with this email already exists.' }
        }
        const newUser: StoredUser = {
          id: uid('usr'), name, email: email.trim(), password, joinedAt: new Date().toISOString(), role: 'customer',
        }
        localStorage.setItem('velvette-users-v1', JSON.stringify([...users, newUser]))
        set({ user: newUser })
        return { ok: true, message: `Account created — welcome to Velvette, ${name.split(' ')[0]}!` }
      },
      signOut: () => set({ user: null }),
      updateProfile: (patch) => {
        const current = get().user
        if (!current) return
        const next = { ...current, ...patch }
        set({ user: next })
        const users = userStore().map((u) => (u.id === next.id ? next : u))
        localStorage.setItem('velvette-users-v1', JSON.stringify(users))
      },
    }),
    { name: 'velvette-auth-v1', partialize: (s) => ({ user: s.user }) },
  ),
)

/** Demo admin credentials are static; admin login is separate from customer auth. */
export const ADMIN_CREDENTIALS = { email: 'admin@velvette.shop', password: 'admin123' }

interface AdminAuthState {
  isAdmin: boolean
  adminEmail: string | null
  adminSignIn: (email: string, password: string) => { ok: boolean; message: string }
  adminSignOut: () => void
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminEmail: null,
      adminSignIn: (email, password) => {
        if (email.trim().toLowerCase() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          set({ isAdmin: true, adminEmail: ADMIN_CREDENTIALS.email })
          return { ok: true, message: 'Signed in to the demo admin console.' }
        }
        return { ok: false, message: 'Invalid demo admin credentials. Use admin@velvette.shop / admin123.' }
      },
      adminSignOut: () => set({ isAdmin: false, adminEmail: null }),
    }),
    { name: 'velvette-admin-auth-v1' },
  ),
)
