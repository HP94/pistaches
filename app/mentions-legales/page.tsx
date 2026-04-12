import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocumentLayout from '@/components/LegalDocumentLayout'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

export const metadata: Metadata = {
  title: 'Mentions légales | Pistâches',
  description: 'Éditeur, hébergeur et informations légales du site Pistâches.',
}

const h2 = 'mt-8 text-base font-semibold text-[#1F2937] first:mt-0'

export default function MentionsLegalesPage() {
  return (
    <LegalDocumentLayout title="Mentions légales" lastUpdated="12 avril 2026">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Conformément aux usages en France pour les sites et services en ligne. Complétez les
        mentions d’identification si votre situation l’exige (entreprise, SIREN, siège social, etc.).
      </p>

      <h2 className={h2}>1. Éditeur du site et du service</h2>
      <p>
        Le service <strong>Pistâches</strong> (site et application web) est édité par :
      </p>
      <ul className="mt-2 list-none space-y-1 pl-0">
        <li>
          <strong>Romain Perroud</strong>
        </li>
        <li>Personne physique</li>
        <li>
          Contact :{' '}
          <a href="mailto:r.perroud.pro@gmail.com" className="font-medium text-[#93C572] hover:underline">
            r.perroud.pro@gmail.com
          </a>
        </li>
      </ul>
      <p className="text-xs text-[#6B7280]">
        Adresse postale : sur demande auprès du contact ci-dessus (non publiée ici pour limiter la
        diffusion de données personnelles).
      </p>

      <h2 className={h2}>2. Directeur de la publication</h2>
      <p>Romain Perroud.</p>

      <h2 className={h2}>3. Hébergement</h2>
      <p>
        L’application est hébergée par <strong>Vercel Inc.</strong>, société de droit américain.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>Site : vercel.com</li>
        <li>
          Coordonnées et mentions légales :{' '}
          <a href="https://vercel.com/legal" target="_blank" rel="noopener noreferrer">
            vercel.com/legal
          </a>
        </li>
      </ul>
      <p className="text-xs text-[#6B7280]">
        Les données applicatives (comptes, foyers, contenus) sont stockées via{' '}
        <strong>Supabase</strong> ; la région effective figure dans votre projet Supabase (souvent
        Union européenne selon la configuration).
      </p>

      <h2 className={h2}>4. Propriété intellectuelle</h2>
      <p>
        Les éléments du service (textes, charte graphique, logo lorsqu’il est protégé, structure des
        pages) sont la propriété de l’éditeur ou font l’objet d’un droit d’utilisation, sauf mention
        contraire. Toute reproduction non autorisée est interdite.
      </p>

      <h2 className={h2}>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans la{' '}
        <Link href={LEGAL_ROUTES.privacy} className="font-medium text-[#93C572] hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>

      <p className="pt-6 text-xs text-[#9CA3AF]">
        <Link href={LEGAL_ROUTES.cgu} className="text-[#93C572] hover:underline">
          Conditions générales d’utilisation
        </Link>
      </p>
    </LegalDocumentLayout>
  )
}
