'use client'

import { useCallback, useEffect, useId, useState } from 'react'

/**
 * CTA + bottom sheet (mobile) / modal (desktop) explaining how to add the PWA
 * to the home screen — Chrome on Android for now.
 */
export default function AddToHomeScreenDrawer() {
  const [open, setOpen] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const check = () => {
      const nav = window.navigator as Navigator & { standalone?: boolean }
      setIsStandalone(mq.matches || nav.standalone === true)
    }
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  if (isStandalone) {
    return null
  }

  return (
    <>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#93C572] bg-white px-4 py-3 text-sm font-medium text-[#5a8f45] shadow-sm transition-colors hover:bg-[#93C572]/10 focus:outline-none focus:ring-2 focus:ring-[#93C572]/40"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? `${titleId}-panel` : undefined}
        >
          <span aria-hidden className="text-lg">
            📱
          </span>
          Ajouter cette app sur votre téléphone
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Fermer"
            onClick={close}
          />

          <div
            id={`${titleId}-panel`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative z-[101] flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-[#E5E7EB] bg-[#FAFAF8] shadow-2xl md:rounded-2xl md:max-h-[min(80vh,560px)]"
          >
            {/* Poignée type “bottom sheet” (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden>
              <div className="h-1.5 w-12 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-3 md:rounded-t-2xl md:pt-4">
              <h2 id={titleId} className="text-lg font-semibold text-[#1F2937]">
                Installer Pistâches
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#93C572]/40"
                aria-label="Fermer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              id={descId}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-[#374151]"
            >
              <p className="mb-1 text-sm font-medium text-[#93C572]">Google Chrome · Android</p>
              <p className="mb-4 text-sm text-[#6B7280]">
                Pour retrouver Pistâches comme une application sur l’écran d’accueil, suivez ces étapes
                dans <strong>Chrome</strong> (pas un autre navigateur).
              </p>

              <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
                <li>
                  Ouvrez ce site dans <strong>Google Chrome</strong> sur votre téléphone Android.
                </li>
                <li>
                  Touchez le menu Chrome <strong>⋮</strong> (trois points, en haut ou en bas selon
                  l’appareil).
                </li>
                <li>
                  Choisissez <strong>« Ajouter à l’écran d’accueil »</strong> ou{' '}
                  <strong>« Installer l’application »</strong> (libellé selon la version de Chrome).
                </li>
                <li>
                  Validez : l’icône <strong>Pistâches</strong> apparaît sur l’écran d’accueil. Vous
                  pouvez l’ouvrir comme une app en plein écran.
                </li>
              </ol>

              <p className="mt-4 rounded-lg bg-[#93C572]/10 px-3 py-2 text-xs text-[#5a7d44]">
                <strong>Astuce :</strong> Chrome peut aussi proposer une bannière « Installer » sur
                certains sites — vous pouvez l’utiliser directement.
              </p>

              <p className="mt-4 text-xs text-[#9CA3AF]">
                Ces instructions ciblent Chrome sous Android. Sur iPhone, l’ajout à l’écran d’accueil
                passe en général par Safari ; nous pourrons documenter ce cas séparément.
              </p>
            </div>

            <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:rounded-b-2xl">
              <button
                type="button"
                onClick={close}
                className="w-full rounded-xl bg-[#93C572] py-3 text-sm font-medium text-white transition-colors hover:bg-[#7bad5c] focus:outline-none focus:ring-2 focus:ring-[#93C572]/50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
