import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, Factory, FlaskConical, Play, TriangleAlert } from 'lucide-react'
import { BATCHES } from '@/data/business'
import { INGREDIENTS, RECIPES } from '@/data/products'
import { formatDateShort, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'

export function ProductionDashboard() {
  const today = BATCHES.filter((b) => b.plannedFor.slice(0, 10) === new Date().toISOString().slice(0, 10))
  const planned = BATCHES.filter((b) => b.status === 'planned')
  const completed = BATCHES.filter((b) => b.status === 'completed')
  const lowIngredients = INGREDIENTS.filter((i) => i.stock <= i.minStock)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">PRODUCTION</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Today's production — Kigali Production Facility</h1>
          <p className="mt-1 text-sm text-slate-500">Start batches, record output and waste.</p>
        </div>
        <Link to="/app/production">
          <Button><Factory className="h-4 w-4" /> Production planner</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Planned today" value={formatNumber(today.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.plannedQty, 0))} hint="units across batches" icon={Factory} />
        <KpiCard label="In progress" value="0" icon={Play} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Completed batches" value={String(completed.length)} icon={CheckCircle2} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Ingredients below min" value={String(lowIngredients.length)} icon={TriangleAlert} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {planned.map((b) => {
              const recipe = RECIPES.find((r) => r.id === b.recipeId)
              return (
                <div key={b.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{b.productName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Batch {b.id.toUpperCase()} · plan {formatNumber(b.plannedQty)} units · {formatDateShort(b.plannedFor)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="blue"><Clock3 className="h-3 w-3" /> Planned</Badge>
                      <Button size="sm"><Play className="h-3.5 w-3.5" /> Start batch</Button>
                    </div>
                  </div>
                  {recipe && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {recipe.ingredients.map((ing) => (
                        <span key={ing.productId} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {ing.name} · {(ing.qtyPerBatch * (b.plannedQty / recipe.batchSize)).toFixed(1)} {ing.unit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingredient stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {INGREDIENTS.slice(0, 6).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{i.name}</p>
                  <p className="text-[11px] text-slate-500">{i.stock} {i.unit}</p>
                </div>
                {i.stock <= i.minStock ? (
                  <Badge tone={i.stock === 0 ? 'red' : 'amber'}>Low</Badge>
                ) : (
                  <Badge tone="emerald">OK</Badge>
                )}
              </div>
            ))}
            <Link to="/app/inventory" className="block text-center text-xs font-semibold text-emerald-600 hover:underline">
              Full inventory
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent completed batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Planned</th>
                  <th className="px-5 py-3">Produced</th>
                  <th className="px-5 py-3">Waste</th>
                  <th className="px-5 py-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completed.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">{b.productName}</td>
                    <td className="px-5 py-3 text-slate-600">{formatNumber(b.plannedQty)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatNumber(b.producedQty)}</td>
                    <td className="px-5 py-3">
                      <span className={b.wasteQty > 0 ? 'text-amber-600' : 'text-emerald-600'}>{b.wasteQty}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{b.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-emerald-800">
          AI recommendation: forecast demand for tomorrow is <strong>870 loaves</strong>, <strong>410 buns</strong> and{' '}
          <strong>175 croissants</strong> — about 6% below today's plan. Adjusting now avoids ~30 loaves of potential waste.
        </p>
      </div>
    </div>
  )
}