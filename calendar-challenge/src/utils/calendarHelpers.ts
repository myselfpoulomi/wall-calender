export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b)
}

export function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export interface CalendarCell {
  date: Date
  inMonth: boolean
}

export function getCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: CalendarCell[] = []

  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate()
  for (let i = 0; i < mondayOffset; i++) {
    const day = prevMonthLastDay - mondayOffset + i + 1
    cells.push({ date: new Date(year, monthIndex - 1, day), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, monthIndex, d), inMonth: true })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    cells.push({ date: next, inMonth: false })
  }
  return cells
}

export function rangeKey(start: string, end: string): string {
  const [lo, hi] =
    compareDateKeys(start, end) <= 0 ? [start, end] : [end, start]
  return `${lo}|${hi}`
}
