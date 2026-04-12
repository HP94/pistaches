import Link from 'next/link'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

const linkClass =
  'block text-sm text-[#93C572] transition-colors hover:text-[#7bad5c] hover:underline'

/** Liens vers les trois documents légaux (menu profil, etc.). */
export function LegalPageLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[#E5E7EB] pt-3">
      <Link href={LEGAL_ROUTES.privacy} className={linkClass} onClick={onNavigate}>
        Politique de confidentialité
      </Link>
      <Link href={LEGAL_ROUTES.mentions} className={linkClass} onClick={onNavigate}>
        Mentions légales
      </Link>
      <Link href={LEGAL_ROUTES.cgu} className={linkClass} onClick={onNavigate}>
        CGU
      </Link>
    </div>
  )
}
