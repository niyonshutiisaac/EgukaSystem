import { useEffect, useRef, useState } from 'react'

const SUPPORTS_RAF = typeof requestAnimationFrame !== 'undefined' && typeof performance !== 'undefined'

/** Animated counter — eases from 0 to `target` once `start` becomes true. */
export function useCountUp(target: number, start: boolean, duration = 1600) {
  const [value, setValue] = useState(() => (SUPPORTS_RAF ? 0 : target))
  const doneRef = useRef(!SUPPORTS_RAF)

  useEffect(() => {
    if (!start || doneRef.current) return
    doneRef.current = true
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])

  return value
}