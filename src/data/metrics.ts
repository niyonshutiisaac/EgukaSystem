export const PLATFORM_METRICS = {
  monthlyRecurringRevenue: 195000,
  annualRecurringRevenue: 2340000,
  activeBusinesses: 4,
  pendingRequests: 3,
  trialBusinesses: 1,
  suspendedBusinesses: 1,
  avgRevenuePerBusiness: 48750,
  seatsSold: 31,
  seatsUsed: 19,
  aiQueriesThisMonth: 1892,
  churnRate: 2.4,
  revenueSeries: [
    { month: 'Feb', revenue: 45000, businesses: 1 },
    { month: 'Mar', revenue: 60000, businesses: 2 },
    { month: 'Apr', revenue: 75000, businesses: 2 },
    { month: 'May', revenue: 105000, businesses: 3 },
    { month: 'Jun', revenue: 120000, businesses: 3 },
    { month: 'Jul', revenue: 160000, businesses: 4 },
    { month: 'Aug', revenue: 195000, businesses: 4 },
  ],
}

export const DAILY_SALES_SERIES = (() => {
  return Array.from({ length: 30 }, (_, i) => {
    const d = 29 - i
    const weekdayFactor = d % 7 === 6 ? 0.62 : d % 7 === 0 ? 0.85 : 1
    const wave = 0.82 + 0.18 * Math.sin((29 - d) / 4)
    const revenue = Math.round(2400000 * wave * weekdayFactor)
    const profit = Math.round(revenue * (0.22 + 0.02 * Math.sin((29 - d) / 5)))
    const orders = Math.round(85 * (0.8 + 0.2 * Math.sin((29 - d) / 3)))
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000)
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue,
      profit,
      orders,
    }
  })
})()

export const BRANCH_PERFORMANCE = [
  { branch: 'Kigali (HQ)', revenue: 8400000, profit: 2100000, waste: 3.2, orders: 1420, growth: 12.4 },
  { branch: 'Kigali Retail', revenue: 3600000, profit: 980000, waste: 2.1, orders: 980, growth: 8.2 },
  { branch: 'Huye', revenue: 4100000, profit: 1000000, waste: 4.8, orders: 640, growth: -2.1 },
  { branch: 'Musanze', revenue: 3700000, profit: 800000, waste: 7.1, orders: 540, growth: 5.6 },
  { branch: 'Rubavu', revenue: 2200000, profit: 490000, waste: 5.4, orders: 320, growth: 9.3 },
]

export const TOP_PRODUCTS = [
  { name: 'White Bread (loaf)', units: 14200, revenue: 11360000, margin: 47.5, trend: 4.2 },
  { name: 'Buns (pack of 6)', units: 6800, revenue: 10200000, margin: 48.0, trend: 2.8 },
  { name: 'Croissant', units: 4100, revenue: 4100000, margin: 46.0, trend: 6.1 },
  { name: 'Mandazi', units: 8200, revenue: 3280000, margin: 60.0, trend: -1.4 },
  { name: 'Cookies (pack)', units: 2300, revenue: 4600000, margin: 45.0, trend: 3.3 },
  { name: 'Milk Bread (loaf)', units: 2900, revenue: 2900000, margin: 44.0, trend: -5.2 },
]