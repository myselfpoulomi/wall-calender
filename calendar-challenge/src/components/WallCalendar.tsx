import { AnimatePresence, motion } from 'framer-motion'
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  compareDateKeys,
  getCalendarCells,
  monthKey,
  toDateKey,
} from '../utils/calendarHelpers'
import { usePersistedNotes } from '../hooks/usePersistedNotes'

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const HERO_BACKGROUNDS = [ '/back1.png', '/back2.png', '/back3.png','/back.png'] as const

const HERO_FADE_TRANSITION = {
  duration: 1.2,
  ease: [0.4, 0, 0.2, 1] as const,
}

const CALENDAR_SLIDE_TRANSITION = {
  x: { type: 'tween' as const, duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
}

function buildCalendarSlideVariants(navDirRef: MutableRefObject<number>) {
  return {
    enter: () => ({
      x: navDirRef.current >= 0 ? '100%' : '-100%',
    }),
    center: { x: 0 },
    exit: () => ({
      x: navDirRef.current >= 0 ? '-100%' : '100%',
    }),
  }
}

function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

const VIEW_STORAGE_KEY = 'wall-calendar-view-v1'

function getInitialCursor(): { y: number; m: number } {
  const now = new Date()
  const fallback = { y: now.getFullYear(), m: now.getMonth() }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    if (!raw) return fallback
    const p = JSON.parse(raw) as { y?: number; m?: number }
    if (
      typeof p.y !== 'number' ||
      typeof p.m !== 'number' ||
      !Number.isInteger(p.y) ||
      !Number.isInteger(p.m) ||
      p.y < 1900 ||
      p.y > 2100 ||
      p.m < 0 ||
      p.m > 11
    ) {
      return fallback
    }
    return { y: p.y, m: p.m }
  } catch {
    return fallback
  }
}

export function WallCalendar() {
  const now = new Date()
  const [cursor, setCursor] = useState(getInitialCursor)

  useEffect(() => {
    try {
      localStorage.setItem(
        VIEW_STORAGE_KEY,
        JSON.stringify({ y: cursor.y, m: cursor.m }),
      )
    } catch {
      // ignore quota / private mode
    }
  }, [cursor.y, cursor.m])
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [showMonthMemoField, setShowMonthMemoField] = useState(false)
  const calendarNavDirRef = useRef(0)
  const calendarSlideVariants = useMemo(
    () => buildCalendarSlideVariants(calendarNavDirRef),
    [],
  )

  const { monthMemos, setMonthMemo } = usePersistedNotes()

  const mk = monthKey(cursor.y, cursor.m)
  const monthMemo = monthMemos[mk] ?? ''

  const heroSrc =
    HERO_BACKGROUNDS[(cursor.y * 12 + cursor.m) % HERO_BACKGROUNDS.length]

  const chevronHeroClass =
    heroSrc === '/back1.png'
      ? ' wall-calendar__chevron--back1'
      : heroSrc === '/back2.png'
        ? ' wall-calendar__chevron--back2'
        : heroSrc === '/back3.png'
          ? ' wall-calendar__chevron--back3'
          : ''

  const rangeThemeClass =
    heroSrc === '/back1.png'
      ? ' wall-calendar--range-back1'
      : heroSrc === '/back2.png'
        ? ' wall-calendar--range-back2'
        : heroSrc === '/back3.png'
          ? ' wall-calendar--range-back3'
          : ' wall-calendar--range-default'

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
    calendarNavDirRef.current = -1
    setCursor((c) => {
      const d = new Date(c.y, c.m - 1, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const nextMonth = () => {
    calendarNavDirRef.current = 1
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
    <div className={`wall-calendar${rangeThemeClass}`}>
      <div className="wall-calendar__sheet">
        <div className="wall-calendar__hero-block">
          <div className="wall-calendar__hero-photo">
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={heroSrc}
                src={heroSrc}
                alt=""
                className="wall-calendar__hero-img"
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={HERO_FADE_TRANSITION}
              />
            </AnimatePresence>
          </div>
          <div className="wall-calendar__chevron-wrap" aria-hidden>
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={heroSrc}
                className={`wall-calendar__chevron${chevronHeroClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={HERO_FADE_TRANSITION}
              />
            </AnimatePresence>
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
                      rows={8}
                      value={monthMemo}
                      onChange={(e) => setMonthMemo(mk, e.target.value)}
                      spellCheck
                    />
                  </>
                ) : null}
              </div>
            </div>
          </aside>

          <div className="wall-calendar__calendar-col">
            <div className="wall-calendar__calendar-slide-clip">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={mk}
                  className="wall-calendar__calendar-slide-page"
                  role="presentation"
                  variants={calendarSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={CALENDAR_SLIDE_TRANSITION}
                >
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
