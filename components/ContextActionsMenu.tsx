'use client'

export type ContextActionItem = {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

type ContextActionsMenuProps = {
  menuKey: string
  openMenuKey: string | null
  onOpenMenuKeyChange: (key: string | null) => void
  items: ContextActionItem[]
  triggerAriaLabel?: string
}

/**
 * Menu « ··· » : même style que sur la page Tâches (bouton + liste déroulante + backdrop).
 */
export function ContextActionsMenu({
  menuKey,
  openMenuKey,
  onOpenMenuKeyChange,
  items,
  triggerAriaLabel = 'Menu',
}: ContextActionsMenuProps) {
  const isOpen = openMenuKey === menuKey

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenMenuKeyChange(isOpen ? null : menuKey)
        }}
        className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-2 text-lg leading-none text-[#1F2937] transition-colors hover:bg-gray-100"
        aria-label={triggerAriaLabel}
        aria-expanded={isOpen}
      >
        ···
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenMenuKeyChange(null)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[#E5E7EB] bg-white shadow-lg backdrop-blur-sm">
            <div className="py-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    item.onClick()
                    onOpenMenuKeyChange(null)
                  }}
                  className={
                    item.variant === 'danger'
                      ? 'w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-100'
                      : 'w-full px-4 py-2 text-left text-sm text-[#1F2937] transition-colors hover:bg-gray-100'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
