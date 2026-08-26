import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn, formatRWF } from '@/lib/utils'
import { Card, CardContent } from './Card'

interface KpiCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconClassName?: string
  hint?: string
}

export function KpiCard({ label, value, change, changeLabel, icon: Icon, iconClassName, hint }: KpiCardProps) {
  const positive = (change ?? 0) >= 0
  return (
    <Card className="animate-fade-up overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-slate-900">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              {typeof change === 'number' && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                    positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
                  )}
                >
                  {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {positive ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
              )}
              {hint && <span className="truncate text-[11px] text-slate-400">{hint}</span>}
              {changeLabel && !hint && <span className="truncate text-[11px] text-slate-400">{changeLabel}</span>}
            </div>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600',
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiMoney({ label, value, change, hint }: { label: string; value: number; change?: number; hint?: string }) {
  return <KpiCard label={label} value={formatRWF(value)} change={change} hint={hint} icon={TrendingUp} />
}