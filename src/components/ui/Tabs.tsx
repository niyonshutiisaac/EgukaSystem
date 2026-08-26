import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: { key: string; label: string; count?: number; badge?: ReactNode }[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-slate-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
            active === tab.key
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                active === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
              )}
            >
              {tab.count}
            </span>
          )}
          {tab.badge}
        </button>
      ))}
    </div>
  )
}