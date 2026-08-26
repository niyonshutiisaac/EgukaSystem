import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/lib/use-count-up'

const SUPPORTS_OBSERVER = typeof IntersectionObserver !== 'undefined'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Animation direction: up (default), left, right, scale */
  dir?: 'up' | 'left' | 'right' | 'scale'
  /** Transition delay in ms — use for stagger effects */
  delay?: number
  /** Only trigger once (default true) */
  once?: boolean
  as?: 'div' | 'section' | 'span'
}

export function Reveal({ children, className, dir = 'up', delay = 0, once = true, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(() => !SUPPORTS_OBSERVER)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, visible])

  const dirClass = dir === 'left' ? 'reveal-left' : dir === 'right' ? 'reveal-right' : dir === 'scale' ? 'reveal-scale' : ''
  const style: CSSProperties = delay ? { ['--reveal-delay' as string]: `${delay}ms` } : {}

  const Tag = as
  return (
    <Tag
      ref={ref as never}
      style={style}
      className={cn('reveal', dirClass, visible && 'reveal-visible', className)}
    >
      {children}
    </Tag>
  )
}

/** Stat counter that starts when scrolled into view. */
interface CounterProps {
  target: number
  format?: (v: number) => string
  suffix?: string
  duration?: number
  className?: string
}

/** Stat counter that starts when scrolled into view. */
export function Counter({ target, format, suffix = '', duration, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(() => !SUPPORTS_OBSERVER)
  const value = useCountUp(target, started, duration)

  useEffect(() => {
    const el = ref.current
    if (!el || started) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  const display = format ? format(value) : Math.round(value).toLocaleString('en-US')
  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  )
}