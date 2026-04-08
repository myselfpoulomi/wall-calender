import { useCallback, useState } from 'react'
import { rangeKey } from '../utils/calendarHelpers'

const STORAGE_KEY = 'wall-calendar-notes-v1'

export interface PersistedNotes {
  monthMemos: Record<string, string>
  rangeMemos: Record<string, string>
}

const empty: PersistedNotes = { monthMemos: {}, rangeMemos: {} }

function load(): PersistedNotes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { monthMemos: {}, rangeMemos: {} }
    const parsed = JSON.parse(raw) as PersistedNotes
    return {
      monthMemos: { ...parsed.monthMemos },
      rangeMemos: { ...parsed.rangeMemos },
    }
  } catch {
    return { monthMemos: {}, rangeMemos: {} }
  }
}

export function usePersistedNotes() {
  const [data, setData] = useState<PersistedNotes>(() =>
    typeof window !== 'undefined' ? load() : empty,
  )

  const setMonthMemo = useCallback((monthKeyStr: string, text: string) => {
    setData((prev) => {
      const next: PersistedNotes = {
        ...prev,
        monthMemos: { ...prev.monthMemos, [monthKeyStr]: text },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setRangeMemo = useCallback((start: string, end: string, text: string) => {
    const rk = rangeKey(start, end)
    setData((prev) => {
      const next: PersistedNotes = {
        ...prev,
        rangeMemos: { ...prev.rangeMemos, [rk]: text },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getRangeMemo = useCallback(
    (start: string, end: string) => {
      const rk = rangeKey(start, end)
      return data.rangeMemos[rk] ?? ''
    },
    [data.rangeMemos],
  )

  return {
    monthMemos: data.monthMemos,
    rangeMemos: data.rangeMemos,
    setMonthMemo,
    setRangeMemo,
    getRangeMemo,
  }
}
