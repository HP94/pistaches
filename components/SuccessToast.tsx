'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

const DEFAULT_MESSAGE = 'Modifications réussies ✅'

export function useSuccessToast(durationMs = 2800) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showSuccessToast = useCallback(
    (text: string = DEFAULT_MESSAGE) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setMessage(text)
      timerRef.current = setTimeout(() => {
        setMessage(null)
        timerRef.current = null
      }, durationMs)
    },
    [durationMs]
  )

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return { toastMessage: message, showSuccessToast }
}

export function SuccessToast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FAFAF8] px-4 py-2.5 text-sm font-medium text-[#1F2937] shadow-[0_4px_24px_rgba(31,41,55,0.08)] ring-1 ring-black/[0.03]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#93C572]" aria-hidden />
        <span>{message}</span>
      </div>
    </div>
  )
}
