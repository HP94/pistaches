import Link from 'next/link'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

const linkClass =
  'text-[#6B7280] transition-colors hover:text-[#93C572] underline-offset-2 hover:underline'

/**
 * Footer légal sur les écrans « avant connexion » (login, inscription, MDP).
 */
export default function AuthLegalFooter() {
  return (
    <footer className="w-full shrink-0 border-t border-[#E5E7EB] bg-[#FAFAF8] py-4 pb-8 sm:pb-4">
      <nav
        className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-center text-xs sm:text-sm"
        aria-label="Informations légales"
      >
        <Link href={LEGAL_ROUTES.privacy} className={linkClass}>
          Politique de confidentialité
        </Link>
        <span className="hidden text-[#D1D5DB] sm:inline" aria-hidden>
          ·
        </span>
        <Link href={LEGAL_ROUTES.mentions} className={linkClass}>
          Mentions légales
        </Link>
        <span className="hidden text-[#D1D5DB] sm:inline" aria-hidden>
          ·
        </span>
        <Link href={LEGAL_ROUTES.cgu} className={linkClass}>
          CGU
        </Link>
      </nav>
    </footer>
  )
}
