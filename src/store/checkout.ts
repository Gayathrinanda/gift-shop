import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, CheckoutState } from '../data/types'
import { uid } from '../lib/utils'

interface CheckoutStore {
  step: number
  data: Partial<CheckoutState>
  savedAddresses: Address[]
  setStep: (n: number) => void
  patch: (p: Partial<CheckoutState>) => void
  saveAddress: (a: Address) => void
  deleteAddress: (id: string) => void
  reset: () => void
}

export const useCheckout = create<CheckoutStore>()(
  persist(
    (set) => ({
      step: 1,
      data: {},
      savedAddresses: [],
      setStep: (n) => set({ step: n }),
      patch: (p) => set((s) => ({ data: { ...s.data, ...p } })),
      saveAddress: (a) =>
        set((s) => ({
          savedAddresses: [a, ...s.savedAddresses.filter((x) => x.id !== a.id)],
        })),
      deleteAddress: (id) => set((s) => ({ savedAddresses: s.savedAddresses.filter((a) => a.id !== id) })),
      reset: () => set({ step: 1, data: {} }),
    }),
    { name: 'velvette-checkout-v1' },
  ),
)

export function newAddressId() {
  return uid('adr')
}
