import type { InventoryMovement } from '../lib/types'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

export const INVENTORY_MOVEMENTS: InventoryMovement[] = [
  { id: 'm-1', productId: 'i-1', productName: 'Wheat Flour', type: 'purchase', qty: 300, balanceAfter: 720, by: 'Patrick Mugisha', at: daysAgo(2), note: 'Supplier delivery — Huye Millers' },
  { id: 'm-2', productId: 'i-1', productName: 'Wheat Flour', type: 'production', qty: -240, balanceAfter: 480, by: 'Claudine Mukamana', at: daysAgo(1), note: 'Batch B-1042' },
  { id: 'm-3', productId: 'i-1', productName: 'Wheat Flour', type: 'waste', qty: -10, balanceAfter: 470, by: 'Claudine Mukamana', at: daysAgo(1), note: 'Spilled during mixing' },
  { id: 'm-4', productId: 'i-1', productName: 'Wheat Flour', type: 'production', qty: -50, balanceAfter: 420, by: 'Claudine Mukamana', at: daysAgo(0), note: 'Batch B-1043' },
  { id: 'm-5', productId: 'i-2', productName: 'Yeast', type: 'purchase', qty: 10, balanceAfter: 20, by: 'Patrick Mugisha', at: daysAgo(1), note: 'Supplier delivery' },
  { id: 'm-6', productId: 'i-2', productName: 'Yeast', type: 'production', qty: -2, balanceAfter: 18, by: 'Claudine Mukamana', at: daysAgo(0), note: 'Batch B-1043' },
  { id: 'm-7', productId: 'p-7', productName: 'Chapati', type: 'sale', qty: -118, balanceAfter: 0, by: 'POS', at: daysAgo(1), note: 'Sold out' },
  { id: 'm-8', productId: 'p-9', productName: 'Milk Bread (loaf)', type: 'waste', qty: -8, balanceAfter: 34, by: 'Eric Niyonsaba', at: daysAgo(1), note: 'Damaged packaging' },
  { id: 'm-9', productId: 'i-7', productName: 'Butter', type: 'adjustment', qty: -1, balanceAfter: 9, by: 'Patrick Mugisha', at: daysAgo(2), note: 'Count correction' },
]