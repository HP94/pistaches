'use client'

import { useMemo, useState } from 'react'
import { formatLocalDate } from '@/components/TaskDayPicker'

function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

type Props = {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

const FR_WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

function normalizedRange(from: string, to: string): { start: string; end: string } {
  if (from <= to) return { start: from, end: to }
  return { start: to, end: from }
}

function isInRange(iso: string, from: string, to: string): boolean {
  if (!from || !to || from === to) return false
  const { start, end } = normalizedRange(from, to)
  return iso >= start && iso <= end
}

function isRangeEndpoint(iso: string, from: string, to: string): boolean {
  if (!from || !to) return iso === from
  if (from === to) return iso === from
  const { start, end } = normalizedRange(from, to)
  return iso === start || iso === end
}

/** Calendrier : 1er clic = début, 2e clic = fin de plage (inclus). 3e clic = nouvelle plage. */
export default function TaskRangePicker({ from, to, onChange }: Props) {
  const today = useMemo(() => formatLocalDate(new Date()), [])
  const initial = from ? parseISODate(from) : new Date()
  const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const mondayBased = (firstDow + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const label = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < mondayBased; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const rangeComplete = Boolean(from && to && from !== to)
  const { start: displayFrom, end: displayTo } =
    from && to ? normalizedRange(from, to) : { start: from, end: to }

  const pick = (day: number) => {
    const iso = formatLocalDate(new Date(year, month, day))
    if (rangeComplete) {
      onChange(iso, iso)
      return
    }
    if (!from) {
      onChange(iso, iso)
      return
    }
    if (from === to) {
      if (iso < from) onChange(iso, from)
      else onChange(from, iso)
      return
    }
    onChange(iso, iso)
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm text-[#6B7280] hover:bg-gray-100"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize text-[#1F2937]">{label}</p>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm text-[#6B7280] hover:bg-gray-100"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      {from && (
        <p className="mb-2 text-xs text-[#6B7280]">
          {rangeComplete
            ? `Du ${displayFrom} au ${displayTo}`
            : `Début : ${from} — choisissez la fin de plage`}
        </p>
      )}
      <p className="mb-2 text-xs text-[#93C572]">Aujourd’hui : {today}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#6B7280]">
        {FR_WEEKDAYS.map((w) => (
          <div key={w} className="py-1 font-medium">
            {w}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />
          const iso = formatLocalDate(new Date(year, month, day))
          const inRange = isInRange(iso, from, to)
          const endpoint = isRangeEndpoint(iso, from, to)
          const isToday = iso === today
          const singleAnchor = from && from === to && iso === from
          return (
            <button
              key={iso}
              type="button"
              onClick={() => pick(day)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                endpoint || singleAnchor
                  ? 'bg-[#93C572] text-white'
                  : inRange
                    ? 'bg-[#93C572]/25 text-[#1F2937]'
                    : isToday
                      ? 'bg-[#93C572]/15 text-[#1F2937]'
                      : 'text-[#1F2937] hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
