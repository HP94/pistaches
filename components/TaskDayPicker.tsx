'use client'

import { useMemo, useState } from 'react'

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

type Props = {
  value: string | null
  onChange: (isoDate: string) => void
}

const FR_WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

/** Calendrier mois : sélection d’un jour (fuseau local). */
export default function TaskDayPicker({ value, onChange }: Props) {
  const today = useMemo(() => formatLocalDate(new Date()), [])
  const initial = value ? parseISODate(value) : new Date()
  const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDow = new Date(year, month, 1).getDay() // 0 Sun
  const mondayBased = (firstDow + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const label = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < mondayBased; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const pick = (day: number) => {
    const iso = formatLocalDate(new Date(year, month, day))
    onChange(iso)
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
          const selected = value === iso
          const isToday = iso === today
          return (
            <button
              key={iso}
              type="button"
              onClick={() => pick(day)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-[#93C572] text-white'
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
