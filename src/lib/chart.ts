import { formatRWF } from '@/lib/utils'

type ValueType = number | string | ReadonlyArray<number | string>
type NameType = number | string

export const chartMoney = (value: ValueType | undefined, name: NameType | undefined): [string, string] => {
  const v = typeof value === 'number' ? value : Number(value ?? 0)
  return [formatRWF(v), String(name ?? '')]
}

export const chartCompact = (value: ValueType | undefined, name: NameType | undefined): [string, string] => {
  const v = typeof value === 'number' ? value : Number(value ?? 0)
  return [formatRWF(v, true), String(name ?? '')]
}