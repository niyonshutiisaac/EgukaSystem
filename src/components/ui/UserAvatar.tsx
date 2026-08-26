import { cn, initials } from '@/lib/utils'

interface AvatarProps {
  name: string
  className?: string
  tone?: 'emerald' | 'slate' | 'amber' | 'blue' | 'violet'
}

const toneClasses = {
  emerald: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
}

export function UserAvatar({ name, className, tone = 'emerald' }: AvatarProps) {
  const text = initials(name) || '?'
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {text}
    </span>
  )
}