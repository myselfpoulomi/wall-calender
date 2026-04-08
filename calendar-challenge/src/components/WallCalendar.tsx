import { useCallback, useMemo, useState } from 'react'
import heroImg from '../assets/hero-wall.png'
import {
  compareDateKeys,
  getCalendarCells,
  monthKey,
  toDateKey,
} from '../utils/calendarHelpers'
import { usePersistedNotes } from '../hooks/usePersistedNotes'

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

export function WallCalendar() {
  const now = new Date()
  const [cursor, setCursor] = useState(() => ({
    y: now.getFullYear(),
    m: now.getMonth(),
  }))
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [showMonthMemoField, setShowMonthMemoField] = useState(false)

  const { monthMemos, setMonthMemo, setRangeMemo, getRangeMemo } =
    usePersistedNotes()

  const mk = monthKey(cursor.y, cursor.m)
  const monthMemo = monthMemos[mk] ?? ''

  const cells = useMemo(
    () => getCalendarCells(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  )

  const todayKey = toDateKey(now)

  const onDayClick = useCallback(
    (key: string) => {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(key)
        setRangeEnd(null)
        return
      }
      if (compareDateKeys(key, rangeStart) < 0) {
        setRangeEnd(rangeStart)
        setRangeStart(key)
      } else {
        setRangeEnd(key)
      }
    },
    [rangeStart, rangeEnd],
  )

  const clearSelection = useCallback(() => {
    setRangeStart(null)
    setRangeEnd(null)
  }, [])

  const selectionMemo =
    rangeStart && rangeEnd ? getRangeMemo(rangeStart, rangeEnd) : ''

  const isInRange = useCallback(
    (key: string) => {
      if (!rangeStart || !rangeEnd) return false
      const lo =
        compareDateKeys(rangeStart, rangeEnd) <= 0 ? rangeStart : rangeEnd
      const hi = lo === rangeStart ? rangeEnd : rangeStart
      return compareDateKeys(key, lo) >= 0 && compareDateKeys(key, hi) <= 0
    },
    [rangeStart, rangeEnd],
  )

  const prevMonth = () => {
    setCursor((c) => {
      const d = new Date(c.y, c.m - 1, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const nextMonth = () => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + 1, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const yearLabel = String(cursor.y)
  const monthLabel = new Date(cursor.y, cursor.m).toLocaleString('en-US', {
    month: 'long',
  }).toUpperCase()

  const handleMonthMemoClick = useCallback(() => {
    setShowMonthMemoField(true)
  }, [])

  return (
    <div className="wall-calendar">
      <div className="wall-calendar__sheet">
        <div className="wall-calendar__hero-block">
          <div className="wall-calendar__hero-photo">
            <img
              src={heroImg}
              alt=""
              className="wall-calendar__hero-img"
              loading="lazy"
            />
          </div>
          <div className="wall-calendar__chevron-wrap" aria-hidden>
            <div className="wall-calendar__chevron" />
            <div className="wall-calendar__masthead">
              <p className="wall-calendar__masthead-year">{yearLabel}</p>
              <p className="wall-calendar__masthead-month">{monthLabel}</p>
            </div>
          </div>
        </div>

        <div className="wall-calendar__body">
          <aside className="wall-calendar__notes-col">
            <p className="wall-calendar__notes-heading">Notes</p>
            <div className="wall-calendar__notepad">
              <div className="wall-calendar__ruled-bg" aria-hidden />
              <div
                className="wall-calendar__notepad-inner"
                onClick={handleMonthMemoClick}
              >
                {!showMonthMemoField && !monthMemo ? (
                  <p className="wall-calendar__notepad-placeholder">
                    Click to add notes...
                  </p>
                ) : null}
                {(showMonthMemoField || monthMemo) ? (
                  <>
                    <label
                      className="wall-calendar__sr-only"
                      htmlFor="month-memo"
                    >
                      Month notes
                    </label>
                    <textarea
                      id="month-memo"
                      className="wall-calendar__notepad-field wall-calendar__notepad-field--primary"
                      rows={5}
                      value={monthMemo}
                      onChange={(e) => setMonthMemo(mk, e.target.value)}
                      spellCheck
                    />
                  </>
                ) : null}

                <div className="wall-calendar__range-notes">
                  <div className="wall-calendar__range-bar">
                    <span className="wall-calendar__range-label">
                      {rangeStart && rangeEnd
                        ? `${rangeStart} — ${rangeEnd}`
                        : 'Select start and end dates'}
                    </span>
                    {rangeStart && rangeEnd ? (
                      <button
                        type="button"
                        className="wall-calendar__clear"
                        onClick={clearSelection}
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  {rangeStart && rangeEnd ? (
                    <>
                      <label
                        className="wall-calendar__sr-only"
                        htmlFor="range-memo"
                      >
                        Notes for selected range
                      </label>
                      <textarea
                        id="range-memo"
                        className="wall-calendar__notepad-field"
                        rows={3}
                        value={selectionMemo}
                        onChange={(e) =>
                          setRangeMemo(rangeStart, rangeEnd, e.target.value)
                        }
                        spellCheck
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          <div className="wall-calendar__calendar-col">
            <div className="wall-calendar__calendar-head">
              <div className="wall-calendar__nav">
                <button
                  type="button"
                  className="wall-calendar__nav-btn"
                  onClick={prevMonth}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="wall-calendar__nav-btn"
                  onClick={nextMonth}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="wall-calendar__weekdays">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className={`wall-calendar__weekday${
                    i >= 5 ? ' wall-calendar__weekday--weekend' : ''
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="wall-calendar__cells">
              {cells.map((cell) => {
                const key = toDateKey(cell.date)
                const inRange = isInRange(key)
                const isStart = rangeStart === key
                const isEnd = rangeEnd === key
                const isToday = key === todayKey
                const weekend = isWeekend(cell.date)

                let cellMod = ''
                if (!cell.inMonth) cellMod = ' wall-calendar__day--muted'
                else if (weekend) cellMod = ' wall-calendar__day--weekend'
                if (inRange) cellMod += ' wall-calendar__day--in-range'
                if (isStart) cellMod += ' wall-calendar__day--start'
                if (isEnd) cellMod += ' wall-calendar__day--end'
                if (isToday) cellMod += ' wall-calendar__day--today'

                return (
                  <button
                    key={`${key}-${cell.inMonth}`}
                    type="button"
                    className={`wall-calendar__day${cellMod}`}
                    onClick={() => onDayClick(key)}
                    aria-label={`${key}${isToday ? ', today' : ''}${
                      isStart ? ', range start' : ''
                    }${isEnd ? ', range end' : ''}`}
                  >
                    <span className="wall-calendar__day-num">
                      {cell.date.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="wall-calendar__legend">
              <span>
                <span className="wall-calendar__swatch wall-calendar__swatch--start" />
                Start
              </span>
              <span>
                <span className="wall-calendar__swatch wall-calendar__swatch--range" />
                Between
              </span>
              <span>
                <span className="wall-calendar__swatch wall-calendar__swatch--end" />
                End
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
