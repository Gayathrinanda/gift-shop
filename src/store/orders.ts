import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../data/types'
import { ORDERS } from '../data/demo'

interface OrdersState {
  orders: Order[]
  placeOrder: (order: Order) => void
  updateStatus: (orderId: string, status: Order['status']) => void
  cancelOrder: (orderId: string) => void
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: ORDERS,
      placeOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateStatus: (orderId, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),
      cancelOrder: (orderId) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' as const } : o)) })),
    }),
    { name: 'velvette-orders-v1' },
  ),
)
