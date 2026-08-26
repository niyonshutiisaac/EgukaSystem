import type { AiInsight, AiRecommendation, Batch, Expense, Notification, Sale, Supplier } from '../lib/types'

export { CUSTOMERS } from './customers'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString()

export const SALES: Sale[] = (() => {
  const sales: Sale[] = []
  const names = [
    { name: 'Walk-in Customers', id: 'c-7' },
    { name: 'ABC Hotel', id: 'c-1' },
    { name: 'Kigali Guest House', id: 'c-2' },
    { name: 'Butare Bakery Supply', id: 'c-3' },
    { name: 'Gicumbi Restaurant', id: 'c-4' },
    { name: 'Musanze Lodge', id: 'c-5' },
    { name: 'Umutoni Retail Shop', id: 'c-6' },
  ]
  const products = [
    { id: 'p-1', name: 'White Bread (loaf)', price: 800 },
    { id: 'p-2', name: 'Buns (pack of 6)', price: 1500 },
    { id: 'p-3', name: 'Croissant', price: 1000 },
    { id: 'p-4', name: 'Chocolate Cake (kg)', price: 12000 },
    { id: 'p-5', name: 'Vanilla Cake (kg)', price: 10000 },
    { id: 'p-6', name: 'Cookies (pack)', price: 2000 },
    { id: 'p-8', name: 'Mandazi', price: 400 },
    { id: 'p-9', name: 'Milk Bread (loaf)', price: 1000 },
    { id: 'p-10', name: 'Samoosa', price: 600 },
  ]
  const paymentMethods: Sale['paymentMethod'][] = ['cash', 'cash', 'cash', 'momo', 'momo', 'card', 'credit']
  for (let d = 29; d >= 0; d--) {
    const count = Math.round(80 + 18 * Math.sin((29 - d) / 3))
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)]!
      const qty = 1 + Math.floor(Math.random() * 6)
      const unitTotal = product.price * qty
      const customer = names[Math.floor(Math.random() * names.length)]!
      sales.push({
        id: `s-${d}-${i}`,
        invoiceNo: `INV-${(7000 + d * 90 + i).toString()}`,
        customerId: customer.id,
        customerName: customer.name,
        branchId: Math.random() > 0.85 ? 'b-huye' : 'b-kgl-shop',
        items: [{ productId: product.id, name: product.name, qty, price: product.price }],
        subtotal: unitTotal,
        discount: Math.random() > 0.9 ? Math.round(unitTotal * 0.05) : 0,
        tax: 0,
        total: unitTotal,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]!,
        paymentStatus: 'paid',
        createdAt: daysAgo(d),
      })
    }
  }
  return sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})()

export const BATCHES: Batch[] = [
  { id: 'b-101', recipeId: 'rc-1', productName: 'White Bread (loaf)', plannedQty: 900, producedQty: 0, wasteQty: 0, status: 'planned', plannedFor: daysAhead(1) },
  { id: 'b-102', recipeId: 'rc-2', productName: 'Buns (pack of 6)', plannedQty: 450, producedQty: 0, wasteQty: 0, status: 'planned', plannedFor: daysAhead(1) },
  { id: 'b-103', recipeId: 'rc-3', productName: 'Croissant', plannedQty: 180, producedQty: 0, wasteQty: 0, status: 'planned', plannedFor: daysAhead(1) },
  { id: 'b-104', recipeId: 'rc-1', productName: 'White Bread (loaf)', plannedQty: 850, producedQty: 832, wasteQty: 12, status: 'completed', plannedFor: daysAgo(0), startedAt: daysAgo(0), completedAt: daysAgo(0), by: 'Claudine Mukamana' },
  { id: 'b-105', recipeId: 'rc-2', productName: 'Buns (pack of 6)', plannedQty: 420, producedQty: 415, wasteQty: 5, status: 'completed', plannedFor: daysAgo(0), startedAt: daysAgo(0), completedAt: daysAgo(0), by: 'Claudine Mukamana' },
  { id: 'b-106', recipeId: 'rc-3', productName: 'Croissant', plannedQty: 160, producedQty: 138, wasteQty: 22, status: 'completed', plannedFor: daysAgo(0), startedAt: daysAgo(0), completedAt: daysAgo(0), by: 'Samuel Byiringiro' },
  { id: 'b-107', recipeId: 'rc-1', productName: 'White Bread (loaf)', plannedQty: 800, producedQty: 796, wasteQty: 4, status: 'completed', plannedFor: daysAgo(1), startedAt: daysAgo(1), completedAt: daysAgo(1), by: 'Claudine Mukamana' },
  { id: 'b-108', recipeId: 'rc-2', productName: 'Buns (pack of 6)', plannedQty: 400, producedQty: 388, wasteQty: 12, status: 'completed', plannedFor: daysAgo(1), startedAt: daysAgo(1), completedAt: daysAgo(1), by: 'Claudine Mukamana' },
]

export const EXPENSES: Expense[] = [
  { id: 'e-1', category: 'Rent', description: 'Kigali Production Facility — monthly rent', amount: 850000, by: 'Patrick Mugisha', at: daysAgo(3) },
  { id: 'e-2', category: 'Utilities', description: 'Electricity bill (June)', amount: 260000, by: 'Patrick Mugisha', at: daysAgo(4) },
  { id: 'e-3', category: 'Transport', description: 'Delivery van fuel + maintenance', amount: 180000, by: 'Patrick Mugisha', at: daysAgo(5) },
  { id: 'e-4', category: 'Salaries', description: 'Staff salaries — monthly', amount: 1450000, by: 'Patrick Mugisha', at: daysAgo(6) },
  { id: 'e-5', category: 'Marketing', description: 'Social media ads (Rwanda promo)', amount: 95000, by: 'Patrick Mugisha', at: daysAgo(7) },
  { id: 'e-6', category: 'Maintenance', description: 'Oven repair — production unit 2', amount: 120000, by: 'Patrick Mugisha', at: daysAgo(9) },
  { id: 'e-7', category: 'Utilities', description: 'Water bill', amount: 45000, by: 'Patrick Mugisha', at: daysAgo(10) },
  { id: 'e-8', category: 'Packaging', description: 'Packaging bags restock', amount: 210000, by: 'Patrick Mugisha', at: daysAgo(11) },
]

export const SUPPLIERS: Supplier[] = [
  { id: 'sp-1', name: 'Huye Millers', phone: '+250 788 100 100', products: ['Wheat Flour'], totalPurchases: 8400000, outstanding: 320000, rating: 4.5 },
  { id: 'sp-2', name: 'Kigali Agro Supplies', phone: '+250 788 200 200', products: ['Sugar', 'Yeast', 'Baking Powder'], totalPurchases: 3600000, outstanding: 0, rating: 4.0 },
  { id: 'sp-3', name: 'Fresh Valley Farms', phone: '+250 788 300 300', products: ['Eggs', 'Milk', 'Butter'], totalPurchases: 2400000, outstanding: 150000, rating: 4.8 },
  { id: 'sp-4', name: 'Rusumo Oils Ltd', phone: '+250 788 400 400', products: ['Cooking Oil'], totalPurchases: 1800000, outstanding: 0, rating: 3.8 },
  { id: 'sp-5', name: 'EcoPack Rwanda', phone: '+250 788 500 500', products: ['Packaging Bags'], totalPurchases: 920000, outstanding: 45000, rating: 4.2 },
]

export const NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Yeast stock running low', body: 'Yeast has 18 kg left and is forecast to run out tomorrow.', kind: 'warning', at: daysAgo(0), read: false },
  { id: 'n-2', title: 'Waste increased 12%', body: 'Waste rose 12% this week, mostly from evening production.', kind: 'warning', at: daysAgo(0), read: false },
  { id: 'n-3', title: 'ABC Hotel overdue invoice', body: 'ABC Hotel has an unpaid balance of 430,000 RWF, 4 days overdue.', kind: 'danger', at: daysAgo(1), read: false },
  { id: 'n-4', title: 'Subscription renewal in 21 days', body: 'Your Professional plan renews on the listed date.', kind: 'info', at: daysAgo(1), read: true },
]

export const AI_INSIGHTS: AiInsight[] = [
  { id: 'ai-1', kind: 'inventory', severity: 'warning', title: 'Yeast may run out tomorrow', body: 'At the current consumption rate of ~2 kg/day, yeast (18 kg) will be exhausted by tomorrow evening. Recommended purchase: 30 kg.' },
  { id: 'ai-2', kind: 'production', severity: 'warning', title: 'Waste increased 12%', body: 'Weekly waste value rose from 48,000 to 53,800 RWF. 70% of the increase comes from the evening production shift.' },
  { id: 'ai-3', kind: 'customer', severity: 'danger', title: 'ABC Hotel has an overdue invoice', body: '430,000 RWF is 4 days overdue. The customer normally pays within 7 days. Consider sending a reminder.' },
  { id: 'ai-4', kind: 'inventory', severity: 'info', title: 'Chapati sold out', body: "Chapati stock reached 0. Historical average demand is 110 pieces/day. Consider adding it to tomorrow's production plan." },
  { id: 'ai-5', kind: 'finance', severity: 'info', title: 'Gross margin trending down', body: 'Margin declined 4.2 points this month, mainly driven by higher flour and packaging costs.' },
  { id: 'ai-6', kind: 'customer', severity: 'warning', title: 'Two wholesale customers inactive', body: 'Butare Bakery Supply and Musanze Lodge have not ordered within their normal intervals (9 and 5 days).' },
]

export const AI_RECOMMENDATIONS: AiRecommendation[] = [
  { id: 'ar-1', title: 'Purchase 30 kg of yeast', detail: 'Demand forecast + supplier lead time of 2 days. Current stock 18 kg covers 1 day.', impact: 'high', kind: 'purchase' },
  { id: 'ar-2', title: "Reduce tomorrow's bread production by 6%", detail: 'Forecast demand is 870 loaves vs. the 900 planned. Avoids ~30 loaves of potential waste.', impact: 'high', kind: 'production' },
  { id: 'ar-3', title: 'Review waste from the evening shift', detail: 'Evening production waste is 2.1x the morning shift across all products.', impact: 'medium', kind: 'waste' },
  { id: 'ar-4', title: 'Follow up with ABC Hotel', detail: 'Invoice of 430,000 RWF is 4 days overdue. Normal payment interval is 7 days.', impact: 'medium', kind: 'customer' },
  { id: 'ar-5', title: 'Restock Milk Bread', detail: "Milk Bread stock (34) is below minimum (60). Add 100 loaves to Friday's plan.", impact: 'low', kind: 'production' },
]