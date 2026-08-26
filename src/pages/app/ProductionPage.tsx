import { useState } from 'react'
import { CheckCircle2, Clock3, Factory, Pencil, Play, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { BATCHES } from '@/data/business'
import { INGREDIENTS, RECIPES } from '@/data/products'
import type { Batch, Recipe } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'

const STATUS_TONES = { planned: 'blue', in_progress: 'amber', completed: 'emerald', cancelled: 'slate' } as const
const TOMORROW = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

export function ProductionPage() {
  const [tab, setTab] = useState('plan')
  const [batches, setBatches] = useState<Batch[]>(BATCHES)
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES)

  const [newOpen, setNewOpen] = useState(false)
  const [recipeId, setRecipeId] = useState(RECIPES[0]?.id ?? '')
  const [plannedQty, setPlannedQty] = useState(RECIPES[0]?.batchSize ?? 100)
  const [plannedFor, setPlannedFor] = useState(TOMORROW)

  const [completeTarget, setCompleteTarget] = useState<Batch | null>(null)
  const [producedQty, setProducedQty] = useState(0)
  const [wasteQty, setWasteQty] = useState(0)

  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null)
  const [ingredientQty, setIngredientQty] = useState<Record<string, number>>({})
  const [newBatchSize, setNewBatchSize] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null)

  const planned = batches.filter((b) => b.status === 'planned')
  const completed = batches.filter((b) => b.status === 'completed')
  const lowIngredients = INGREDIENTS.filter((i) => i.stock <= i.minStock)

  const planTotal = planned.reduce((s, b) => s + b.plannedQty, 0)
  const completedTotal = completed.reduce((s, b) => s + b.producedQty, 0)
  const wasteTotal = completed.reduce((s, b) => s + b.wasteQty, 0)

  const selectedRecipe = recipes.find((r) => r.id === recipeId)

  const openNewBatch = () => {
    setRecipeId(recipes[0]?.id ?? '')
    setPlannedQty(recipes[0]?.batchSize ?? 100)
    setPlannedFor(TOMORROW)
    setNewOpen(true)
  }

  const createBatch = () => {
    if (!selectedRecipe || plannedQty <= 0) return
    setBatches((prev) => [
      {
        id: `b-${prev.length + 1}`,
        recipeId: selectedRecipe.id,
        productName: selectedRecipe.productName,
        plannedQty,
        producedQty: 0,
        wasteQty: 0,
        status: 'planned',
        plannedFor,
      },
      ...prev,
    ])
    setNewOpen(false)
  }

  const startBatch = (id: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'in_progress', startedAt: new Date().toISOString() } : b)),
    )
  }

  const openComplete = (b: Batch) => {
    setCompleteTarget(b)
    setProducedQty(b.plannedQty)
    setWasteQty(0)
  }

  const completeBatch = () => {
    if (!completeTarget) return
    setBatches((prev) =>
      prev.map((b) =>
        b.id === completeTarget.id
          ? { ...b, status: 'completed', producedQty, wasteQty, completedAt: new Date().toISOString(), by: 'Jean Claude' }
          : b,
      ),
    )
    setCompleteTarget(null)
  }

  const openEditRecipe = (id: string) => {
    const r = recipes.find((x) => x.id === id)
    if (!r) return
    setEditRecipe(r)
    setNewBatchSize(r.batchSize)
    setIngredientQty(Object.fromEntries(r.ingredients.map((i) => [i.productId, i.qtyPerBatch])))
  }

  const saveRecipe = () => {
    if (!editRecipe) return
    const updated: Recipe = {
      ...editRecipe,
      batchSize: newBatchSize,
      version: editRecipe.version + 1,
      ingredients: editRecipe.ingredients.map((ing) => ({
        ...ing,
        qtyPerBatch: ingredientQty[ing.productId] ?? ing.qtyPerBatch,
      })),
    }
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setEditRecipe(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production planning"
        description="Plan tomorrow's batches from recipes, check ingredient availability and record waste."
        actions={
          <Button onClick={openNewBatch}><Plus className="h-4 w-4" /> New batch</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Planned units (tomorrow)" value={formatNumber(planTotal)} icon={Factory} />
        <KpiCard label="Completed this week" value={formatNumber(completedTotal)} icon={CheckCircle2} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Waste this week" value={formatNumber(wasteTotal)} icon={TriangleAlert} iconClassName="bg-red-50 text-red-600" />
        <KpiCard label="Ingredients below min" value={String(lowIngredients.length)} icon={TriangleAlert} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <Tabs
        tabs={[
          { key: 'plan', label: 'Production plan', count: planned.length },
          { key: 'batches', label: 'Batch history', count: completed.length },
          { key: 'recipes', label: 'Recipes', count: recipes.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'plan' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <Factory className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="text-xs leading-relaxed text-emerald-800">
              <p className="font-semibold">AI forecast for tomorrow</p>
              <p className="mt-1">
                Expected demand: <strong>870 bread</strong> · <strong>410 buns</strong> · <strong>175 croissants</strong>.
                Your current plan is 3% above forecast — approving the AI plan avoids ~30 units of potential waste.
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm">Approve AI plan</Button>
                <Button size="sm" variant="outline">Keep my plan</Button>
              </div>
            </div>
          </div>
          {planned.map((b) => {
            const recipe = recipes.find((r) => r.id === b.recipeId)
            return (
              <Card key={b.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{b.productName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Batch {b.id.toUpperCase()} · plan {formatNumber(b.plannedQty)} units · recipe v{recipe?.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONES[b.status]} className="capitalize">
                        {b.status === 'in_progress' ? <Clock3 className="h-3 w-3" /> : null} {b.status.replace('_', ' ')}
                      </Badge>
                      {b.status === 'planned' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setDeleteTarget(b)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" onClick={() => startBatch(b.id)}><Play className="h-3.5 w-3.5" /> Start batch</Button>
                        </>
                      )}
                      {b.status === 'in_progress' && (
                        <Button size="sm" onClick={() => openComplete(b)}><CheckCircle2 className="h-3.5 w-3.5" /> Complete batch</Button>
                      )}
                    </div>
                  </div>
                  {recipe && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {recipe.ingredients.map((ing) => {
                        const required = ing.qtyPerBatch * (b.plannedQty / recipe.batchSize)
                        const available = INGREDIENTS.find((i) => i.id === ing.productId)?.stock ?? 0
                        const insufficient = available < required
                        return (
                          <div key={ing.productId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                            <span className="text-slate-600">{ing.name}</span>
                            <span className={cn('font-semibold', insufficient ? 'text-red-600' : 'text-slate-800')}>
                              {required.toFixed(1)} {ing.unit}
                              <span className="ml-1 font-normal text-slate-400">(have {available})</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'batches' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Batch</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Planned</th>
                    <th className="px-5 py-3">Produced</th>
                    <th className="px-5 py-3">Waste</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-medium text-slate-700">{b.id.toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{b.productName}</td>
                      <td className="px-5 py-3 text-slate-600">{formatNumber(b.plannedQty)}</td>
                      <td className="px-5 py-3 text-slate-600">{b.producedQty > 0 ? formatNumber(b.producedQty) : '—'}</td>
                      <td className="px-5 py-3">
                        {b.wasteQty > 0 ? <span className="font-medium text-amber-600">{b.wasteQty}</span> : '—'}
                      </td>
                      <td className="px-5 py-3"><Badge tone={STATUS_TONES[b.status]} className="capitalize">{b.status.replace('_', ' ')}</Badge></td>
                      <td className="px-5 py-3 text-slate-500">{b.by ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'recipes' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {recipes.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{r.productName}</p>
                  <Badge tone="slate">v{r.version}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Batch size: {r.batchSize} units</p>
                <div className="mt-3 space-y-1.5">
                  {r.ingredients.map((ing) => (
                    <div key={ing.productId} className="flex justify-between text-xs">
                      <span className="text-slate-600">{ing.name}</span>
                      <span className="font-medium text-slate-800">{ing.qtyPerBatch} {ing.unit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditRecipe(r.id)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit recipe
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setRecipeId(r.id)
                      setPlannedQty(r.batchSize)
                      setPlannedFor(TOMORROW)
                      setNewOpen(true)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Plan batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Create production batch"
        description="Plan a new batch from a recipe. Ingredients will be reserved when the batch starts."
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createBatch} disabled={!selectedRecipe || plannedQty <= 0}>Create batch</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Recipe">
            <Select value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.productName} (batch of {r.batchSize})</option>
              ))}
            </Select>
          </Field>
          <Field label="Planned quantity (units)">
            <Input type="number" min={1} value={plannedQty} onChange={(e) => setPlannedQty(Number(e.target.value))} />
          </Field>
          <Field label="Production date">
            <Input type="date" value={plannedFor} onChange={(e) => setPlannedFor(e.target.value)} />
          </Field>
          {selectedRecipe && plannedQty > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Required ingredients</p>
              <div className="mt-2 space-y-1.5">
                {selectedRecipe.ingredients.map((ing) => {
                  const required = ing.qtyPerBatch * (plannedQty / selectedRecipe.batchSize)
                  const available = INGREDIENTS.find((i) => i.id === ing.productId)?.stock ?? 0
                  return (
                    <div key={ing.productId} className="flex justify-between text-xs">
                      <span className="text-slate-600">{ing.name}</span>
                      <span className={cn('font-medium', available < required ? 'text-red-600' : 'text-slate-800')}>
                        {required.toFixed(1)} {ing.unit} · have {available}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title={`Complete batch ${completeTarget?.id.toUpperCase()}`}
        description={`Record the actual output for ${completeTarget?.productName}. Waste is subtracted from produced stock.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCompleteTarget(null)}>Cancel</Button>
            <Button onClick={completeBatch} disabled={!completeTarget || producedQty < 0 || wasteQty < 0}>
              Complete batch
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Produced (units)" hint={`Planned: ${completeTarget?.plannedQty ?? 0}`}>
            <Input type="number" min={0} value={producedQty} onChange={(e) => setProducedQty(Number(e.target.value))} />
          </Field>
          <Field label="Waste (units)">
            <Input type="number" min={0} value={wasteQty} onChange={(e) => setWasteQty(Number(e.target.value))} />
          </Field>
          {wasteQty > 0 && (
            <p className="sm:col-span-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {Math.round((wasteQty / (producedQty + wasteQty || 1)) * 100)}% waste rate — above the 2% target. The
              production lead will be notified.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={!!editRecipe}
        onClose={() => setEditRecipe(null)}
        title={`Edit recipe — ${editRecipe?.productName}`}
        description="Adjust batch size and ingredient quantities. A new version will be saved automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditRecipe(null)}>Cancel</Button>
            <Button onClick={saveRecipe} disabled={newBatchSize <= 0}>Save recipe v{(editRecipe?.version ?? 0) + 1}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Batch size (units)">
            <Input type="number" min={1} value={newBatchSize} onChange={(e) => setNewBatchSize(Number(e.target.value))} />
          </Field>
          <div className="rounded-xl border border-slate-200">
            {editRecipe?.ingredients.map((ing) => (
              <div key={ing.productId} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{ing.name}</p>
                  <p className="text-[11px] text-slate-400">per batch</p>
                </div>
                <div className="flex w-28 items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={ingredientQty[ing.productId] ?? ing.qtyPerBatch}
                    onChange={(e) => setIngredientQty({ ...ingredientQty, [ing.productId]: Number(e.target.value) })}
                  />
                  <span className="text-xs text-slate-500">{ing.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete batch ${deleteTarget?.id.toUpperCase()}?`}
        description={`The planned batch of ${deleteTarget?.productName} will be removed from the production plan.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setBatches((prev) => prev.filter((b) => b.id !== deleteTarget?.id))}
      />
    </div>
  )
}