// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import TaskRangePicker from '@/components/TaskRangePicker'

function RangeHarness() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  return <TaskRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t) }} />
}

describe('TaskRangePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 10))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets start on first click and completes range on second click', () => {
    render(<RangeHarness />)

    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '15' }))

    expect(screen.getByText(/Du 2026-05-05 au 2026-05-15/)).toBeInTheDocument()
  })

  it('shows range label when complete', () => {
    render(
      <TaskRangePicker
        from="2026-05-01"
        to="2026-05-15"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/Du 2026-05-01 au 2026-05-15/)).toBeInTheDocument()
  })
})
