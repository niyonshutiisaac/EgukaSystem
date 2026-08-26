import { useCallback, useMemo, useState } from 'react'
import { Banknote, CreditCard, Minus, Plus, Printer, ScanBarcode, Search, Smartphone, Trash2 } from 'lucide-react'
import { PRODUCTS } from '@/data/products'
import type { Sale } from '@/lib/types'
import { cn, formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
  unit: string
}

const PAYMENT_METHODS: { id: Sale['paymentMethod']; label: string; icon: typeof Banknote; desc: string }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote, desc: 'Physical cash' },
  { id: 'momo', label: 'Mobile Money', icon: Smartphone, desc: 'MTN MoMo / Airtel Money' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Bank card / QR' },
  { id: 'credit', label: 'Credit', icon: Banknote, desc: 'Customer account' },
]

export function PosPage() {
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [method, setMethod] = useState<Sale['paymentMethod']>('cash')
  const [receipt, setReceipt] = useState<Sale | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  const filtered = useMemo(
    () => PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const addToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === id)
      if (existing) return prev.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i))
      const product = PRODUCTS.find((p) => p.id === id)!
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, unit: product.unit }]
    })
  }

  const setQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.productId !== id))

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const itemCount = cart.reduce((s, i) => s + i.qty, 0)

  const completeSale = useCallback(() => {
    const sale: Sale = {
      id: `s-new-${Date.now()}`,
      invoiceNo: `INV-${String(7200 + completedCount).padStart(4, '0')}`,
      customerName: method === 'credit' ? 'Credit customer' : 'Walk-in Customers',
      branchId: 'b-kgl-shop',
      items: cart.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      paymentMethod: method,
      paymentStatus: method === 'credit' ? 'credit' : 'paid',
      createdAt: new Date().toISOString(),
    }
    setReceipt(sale)
    setPaymentOpen(false)
    setCart([])
    setCompletedCount((c) => c + 1)
  }, [cart, method, subtotal, completedCount])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of sale"
        description="Fast checkout for counter sales. Cart, discounts, multiple payment methods and receipts."
        actions={<Button variant="outline"><Printer className="h-4 w-4" /> Print receipt</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Search products by name or barcode…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p.id)}
                className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-400">{p.sku}</span>
                  <Badge tone={p.stock === 0 ? 'red' : p.stock <= p.minStock ? 'amber' : 'emerald'}>
                    {p.stock === 0 ? 'Out' : `${p.stock} ${p.unit}`}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-base font-bold text-emerald-600">{formatRWF(p.price)}</p>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Card className="xl:col-span-2">
          <CardContent className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanBarcode className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">Current sale</h3>
              </div>
              <Badge tone="slate">{itemCount} items</Badge>
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {cart.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                  <ScanBarcode className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">Cart is empty</p>
                  <p className="text-xs text-slate-400">Tap products on the left to add them.</p>
                </div>
              )}
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatRWF(item.price)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setQty(item.productId, -1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setQty(item.productId, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="w-20 text-right text-sm font-semibold text-slate-900">{formatRWF(item.price * item.qty)}</p>
                  <button className="text-slate-300 hover:text-red-500" onClick={() => removeFromCart(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatRWF(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>Discount</span><span className="text-emerald-600">0 RWF</span></div>
              <div className="flex justify-between text-base font-bold text-slate-900"><span>Total</span><span>{formatRWF(subtotal)}</span></div>
              <Button className="mt-2 w-full" size="lg" disabled={cart.length === 0} onClick={() => setPaymentOpen(true)}>
                Charge {formatRWF(subtotal)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete sale"
        description={`Total due: ${formatRWF(subtotal)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={completeSale} disabled={cart.length === 0}>
              Complete & print receipt
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                method === m.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <m.icon className={cn('h-5 w-5', method === m.id ? 'text-emerald-600' : 'text-slate-400')} />
              <p className="mt-2 text-sm font-semibold text-slate-900">{m.label}</p>
              <p className="text-[11px] text-slate-500">{m.desc}</p>
            </button>
          ))}
        </div>
        {method === 'credit' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            The amount will be added to the customer's outstanding balance.
          </div>
        )}
      </Modal>

      <Modal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        size="sm"
        title="Receipt issued"
        description={receipt?.invoiceNo}
        footer={
          <>
            <Button variant="outline" onClick={() => setReceipt(null)}>Close</Button>
            <Button onClick={() => setReceipt(null)}><Printer className="h-4 w-4" /> Print again</Button>
          </>
        }
      >
        {receipt && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="font-bold text-slate-900">ABC Bakery Ltd</p>
              <p className="text-xs text-slate-500">KN 3 Ave, Nyarugenge · +250 788 123 456</p>
              <p className="mt-1 text-xs text-slate-500">{receipt.invoiceNo} · {new Date(receipt.createdAt).toLocaleString()}</p>
            </div>
            <div className="divide-y divide-dashed divide-slate-200">
              {receipt.items.map((i) => (
                <div key={i.productId} className="flex justify-between py-1.5 text-xs">
                  <span className="text-slate-600">{i.name} × {i.qty}</span>
                  <span className="font-medium text-slate-900">{formatRWF(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-900">TOTAL</span>
              <span className="font-bold text-emerald-600">{formatRWF(receipt.total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Paid via</span>
              <Badge tone="emerald">{receipt.paymentMethod}</Badge>
            </div>
            <p className="text-center text-[11px] text-slate-400">Thank you for shopping with us!</p>
          </div>
        )}
      </Modal>
    </div>
  )
}