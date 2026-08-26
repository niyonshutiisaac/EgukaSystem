import type { Customer } from '../lib/types'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

export const CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'ABC Hotel', phone: '+250 788 111 111', email: 'orders@abchotel.rw', type: 'wholesale', balance: 430000, totalPurchases: 12800000, orderCount: 184, lastOrderAt: daysAgo(8), avgOrderIntervalDays: 4, city: 'Kigali', notes: 'Orders every Monday and Thursday. Credit limit 500,000 RWF.' },
  { id: 'c-2', name: 'Kigali Guest House', phone: '+250 788 222 222', type: 'wholesale', balance: 0, totalPurchases: 6400000, orderCount: 96, lastOrderAt: daysAgo(2), avgOrderIntervalDays: 6, city: 'Kigali' },
  { id: 'c-3', name: 'Butare Bakery Supply', phone: '+250 788 333 333', type: 'wholesale', balance: 150000, totalPurchases: 3100000, orderCount: 41, lastOrderAt: daysAgo(12), avgOrderIntervalDays: 9, city: 'Huye' },
  { id: 'c-4', name: 'Gicumbi Restaurant', phone: '+250 788 444 444', type: 'credit', balance: 0, totalPurchases: 890000, orderCount: 38, lastOrderAt: daysAgo(5), avgOrderIntervalDays: 7, city: 'Gicumbi' },
  { id: 'c-5', name: 'Musanze Lodge', phone: '+250 788 555 555', type: 'wholesale', balance: 230000, totalPurchases: 2200000, orderCount: 30, lastOrderAt: daysAgo(15), avgOrderIntervalDays: 5, city: 'Musanze' },
  { id: 'c-6', name: 'Umutoni Retail Shop', phone: '+250 788 666 666', type: 'credit', balance: 45000, totalPurchases: 610000, orderCount: 64, lastOrderAt: daysAgo(1), avgOrderIntervalDays: 3, city: 'Kigali' },
  { id: 'c-7', name: 'Walk-in Customers', phone: '-', type: 'walk-in', balance: 0, totalPurchases: 18000000, orderCount: 2400, lastOrderAt: daysAgo(0), avgOrderIntervalDays: 1, city: 'Kigali' },
]