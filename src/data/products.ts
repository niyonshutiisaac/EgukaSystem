import type { Product, Recipe } from '../lib/types'

export const PRODUCTS: Product[] = [
  { id: 'p-1', name: 'White Bread (loaf)', category: 'Bread', sku: 'BRD-001', price: 800, cost: 420, stock: 340, minStock: 120, unit: 'loaf', barcode: '200000001' },
  { id: 'p-2', name: 'Buns (pack of 6)', category: 'Bread', sku: 'BRD-002', price: 1500, cost: 780, stock: 210, minStock: 80, unit: 'pack', barcode: '200000002' },
  { id: 'p-3', name: 'Croissant', category: 'Pastry', sku: 'PST-001', price: 1000, cost: 540, stock: 145, minStock: 60, unit: 'piece', barcode: '200000003' },
  { id: 'p-4', name: 'Chocolate Cake (kg)', category: 'Cakes', sku: 'CAK-001', price: 12000, cost: 6800, stock: 8, minStock: 3, unit: 'kg', barcode: '200000004' },
  { id: 'p-5', name: 'Vanilla Cake (kg)', category: 'Cakes', sku: 'CAK-002', price: 10000, cost: 5600, stock: 5, minStock: 3, unit: 'kg', barcode: '200000005' },
  { id: 'p-6', name: 'Cookies (pack)', category: 'Pastry', sku: 'PST-002', price: 2000, cost: 1100, stock: 96, minStock: 40, unit: 'pack', barcode: '200000006' },
  { id: 'p-7', name: 'Chapati', category: 'Bread', sku: 'BRD-003', price: 500, cost: 210, stock: 0, minStock: 100, unit: 'piece', barcode: '200000007' },
  { id: 'p-8', name: 'Mandazi', category: 'Pastry', sku: 'PST-003', price: 400, cost: 160, stock: 260, minStock: 100, unit: 'piece', barcode: '200000008' },
  { id: 'p-9', name: 'Milk Bread (loaf)', category: 'Bread', sku: 'BRD-004', price: 1000, cost: 560, stock: 34, minStock: 60, unit: 'loaf', barcode: '200000009' },
  { id: 'p-10', name: 'Samoosa', category: 'Pastry', sku: 'PST-004', price: 600, cost: 280, stock: 120, minStock: 50, unit: 'piece', barcode: '200000010' },
]

export const INGREDIENTS: Product[] = [
  { id: 'i-1', name: 'Wheat Flour', category: 'Ingredient', sku: 'ING-001', price: 520, cost: 520, stock: 420, minStock: 200, unit: 'kg' },
  { id: 'i-2', name: 'Yeast', category: 'Ingredient', sku: 'ING-002', price: 3500, cost: 3500, stock: 18, minStock: 15, unit: 'kg' },
  { id: 'i-3', name: 'Sugar', category: 'Ingredient', sku: 'ING-003', price: 1100, cost: 1100, stock: 62, minStock: 40, unit: 'kg' },
  { id: 'i-4', name: 'Eggs', category: 'Ingredient', sku: 'ING-004', price: 300, cost: 300, stock: 480, minStock: 200, unit: 'piece' },
  { id: 'i-5', name: 'Cooking Oil', category: 'Ingredient', sku: 'ING-005', price: 1800, cost: 1800, stock: 35, minStock: 20, unit: 'L' },
  { id: 'i-6', name: 'Milk', category: 'Ingredient', sku: 'ING-006', price: 1200, cost: 1200, stock: 22, minStock: 15, unit: 'L' },
  { id: 'i-7', name: 'Butter', category: 'Ingredient', sku: 'ING-007', price: 4500, cost: 4500, stock: 9, minStock: 8, unit: 'kg' },
  { id: 'i-8', name: 'Baking Powder', category: 'Ingredient', sku: 'ING-008', price: 2500, cost: 2500, stock: 6, minStock: 5, unit: 'kg' },
  { id: 'i-9', name: 'Salt', category: 'Ingredient', sku: 'ING-009', price: 400, cost: 400, stock: 55, minStock: 20, unit: 'kg' },
  { id: 'i-10', name: 'Packaging Bags', category: 'Packaging', sku: 'PKG-001', price: 150, cost: 150, stock: 1800, minStock: 500, unit: 'piece' },
]

export const RECIPES: Recipe[] = [
  {
    id: 'rc-1',
    productId: 'p-1',
    productName: 'White Bread (loaf)',
    batchSize: 100,
    version: 3,
    ingredients: [
      { productId: 'i-1', name: 'Wheat Flour', qtyPerBatch: 62, unit: 'kg' },
      { productId: 'i-2', name: 'Yeast', qtyPerBatch: 0.8, unit: 'kg' },
      { productId: 'i-3', name: 'Sugar', qtyPerBatch: 4, unit: 'kg' },
      { productId: 'i-5', name: 'Cooking Oil', qtyPerBatch: 3, unit: 'L' },
      { productId: 'i-9', name: 'Salt', qtyPerBatch: 1.2, unit: 'kg' },
      { productId: 'i-10', name: 'Packaging Bags', qtyPerBatch: 100, unit: 'piece' },
    ],
  },
  {
    id: 'rc-2',
    productId: 'p-2',
    productName: 'Buns (pack of 6)',
    batchSize: 50,
    version: 2,
    ingredients: [
      { productId: 'i-1', name: 'Wheat Flour', qtyPerBatch: 28, unit: 'kg' },
      { productId: 'i-2', name: 'Yeast', qtyPerBatch: 0.5, unit: 'kg' },
      { productId: 'i-3', name: 'Sugar', qtyPerBatch: 6, unit: 'kg' },
      { productId: 'i-4', name: 'Eggs', qtyPerBatch: 20, unit: 'piece' },
      { productId: 'i-5', name: 'Cooking Oil', qtyPerBatch: 2, unit: 'L' },
    ],
  },
  {
    id: 'rc-3',
    productId: 'p-3',
    productName: 'Croissant',
    batchSize: 40,
    version: 1,
    ingredients: [
      { productId: 'i-1', name: 'Wheat Flour', qtyPerBatch: 14, unit: 'kg' },
      { productId: 'i-7', name: 'Butter', qtyPerBatch: 6, unit: 'kg' },
      { productId: 'i-3', name: 'Sugar', qtyPerBatch: 1.5, unit: 'kg' },
      { productId: 'i-2', name: 'Yeast', qtyPerBatch: 0.3, unit: 'kg' },
      { productId: 'i-6', name: 'Milk', qtyPerBatch: 4, unit: 'L' },
    ],
  },
]