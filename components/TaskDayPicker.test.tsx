// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import TaskDayPicker from '@/components/TaskDayPicker'

describe('TaskDayPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 10)) // 10 May 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onChange with ISO date when a day is clicked', () => {
    const onChange = vi.fn()
    render(<TaskDayPicker value={null} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '15' }))

    expect(onChange).toHaveBeenCalledWith('2026-05-15')
  })

  it('marks the selected day with selection styling', () => {
    render(<TaskDayPicker value="2026-05-15" onChange={vi.fn()} />)

    const day15 = screen
      .getAllByRole('button', { name: '15' })
      .find((el) => el.className.includes('text-white'))
    expect(day15).toBeDefined()
    expect(day15!.className).toContain('bg-[#93C572]')
  })
})
