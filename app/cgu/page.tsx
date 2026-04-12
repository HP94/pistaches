import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocumentLayout from '@/components/LegalDocumentLayout'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation | Pistâches',
  description: 'CGU et conditions de la bêta Pistâches.',
}

const h2 = 'mt-8 text-base font-semibold text-[#1F2937] first:mt-0'
const ul = 'mt-2 list-disc space-y-1 pl-5'

export default function CguPage() {
  return (
    <LegalDocumentLayout
      title="Conditions générales d’utilisation (CGU)"
      lastUpdated="12 avril 2026"
    >
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Document type à adapter avec un professionnel du droit. En cas de contradiction avec la loi,
        les dispositions impératives prévalent.
      </p>

      <h2 className={h2}>1. Objet</h2>
      <p>
        Les présentes <strong>Conditions générales d’utilisation</strong> (« CGU ») régissent l’accès
        et l’utilisation du service en ligne <strong>Pistâches</strong>, qui permet la gestion des
        tâches et de la répartition au sein d’un foyer.
      </p>
      <p>
        En créant un compte ou en utilisant le service, vous reconnaissez avoir pris connaissance des
        CGU et de la{' '}
        <Link href={LEGAL_ROUTES.privacy} className="font-medium text-[#93C572] hover:underline">
          politique de confidentialité
        </Link>{' '}
        et les accepter.
      </p>

      <h2 className={h2}>2. Éditeur</h2>
      <p>
        Le service est proposé par <strong>Romain Perroud</strong> (personne physique), contact :{' '}
        <a href="mailto:r.perroud.pro@gmail.com" className="font-medium text-[#93C572] hover:underline">
          r.perroud.pro@gmail.com
        </a>
        .
      </p>

      <h2 className={h2}>3. Accès au service — bêta</h2>
      <p>
        Pistâches est proposé en <strong>version bêta</strong>, à des utilisateurs sélectionnés,{' '}
        <strong>gratuitement</strong>. L’accès peut être limité, retiré ou modifié à tout moment. Le
        service peut être <strong>interrompu</strong>, <strong>instable</strong> ou faire l’objet de{' '}
        <strong>modifications majeures</strong> (y compris données) sans préavis prolongé.
      </p>
      <ul className={ul}>
        <li>Aucune garantie de disponibilité, de performance ni d’absence d’erreurs.</li>
        <li>
          Des <strong>pertes de données</strong> ou réinitialisations peuvent survenir ; il appartient
          aux utilisateurs de conserver si besoin des copies de leurs informations importantes.
        </li>
        <li>
          La bêta sert à tester et améliorer le produit ; les retours utilisateurs sont les bienvenus
          via le contact indiqué.
        </li>
      </ul>

      <h2 className={h2}>4. Compte utilisateur</h2>
      <ul className={ul}>
        <li>
          L’inscription est réservée aux <strong>personnes majeures</strong> capables de contracter
          en France.
        </li>
        <li>
          Vous vous engagez à fournir des informations exactes et à préserver la{' '}
          <strong>confidentialité</strong> de vos identifiants.
        </li>
        <li>
          Toute utilisation du service avec votre compte est réputée effectuée par vous, sauf preuve
          contraire.
        </li>
        <li>
          L’éditeur peut suspendre ou clôturer un compte en cas de manquement aux CGU ou de risque pour
          la sécurité.
        </li>
      </ul>

      <h2 className={h2}>5. Foyers et membres</h2>
      <p>
        Vous êtes responsable des invitations et des informations saisies concernant les membres de
        votre foyer (y compris les personnes sans compte). Vous garantissez disposer des droits et
        autorisations nécessaires.
      </p>

      <h2 className={h2}>6. Contenus et usage loyal</h2>
      <p>Il est interdit notamment de :</p>
      <ul className={ul}>
        <li>porter atteinte aux droits de tiers ou à la loi ;</li>
        <li>tenter d’accéder de manière non autorisée aux systèmes ou aux données d’autres utilisateurs ;</li>
        <li>surcharger ou perturber le service ;</li>
        <li>utiliser le service à des fins illicites ou abusives.</li>
      </ul>

      <h2 className={h2}>7. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{' '}
        <Link href={LEGAL_ROUTES.privacy} className="font-medium text-[#93C572] hover:underline">
          politique de confidentialité
        </Link>
        . Les finalités liées aux <strong>statistiques et à la recherche</strong> reposent sur un{' '}
        <strong>consentement distinct</strong> ; le refus n’empêche pas l’usage du service.
      </p>

      <h2 className={h2}>8. Propriété intellectuelle</h2>
      <p>
        Le service, son code, ses textes et éléments graphiques (sauf contenus fournis par les
        utilisateurs) restent la propriété de l’éditeur ou de ses concédants. Aucune licence n’est
        accordée au-delà du droit d’utiliser le service conformément aux CGU.
      </p>

      <h2 className={h2}>9. Limitation de responsabilité</h2>
      <p>
        Dans les limites autorisées par la loi, l’éditeur ne saurait être tenu responsable des dommages
        indirects, perte de données, perte d’exploitation ou préjudice moral liés à l’usage ou à
        l’impossibilité d’utiliser le service, notamment en période de bêta.
      </p>

      <h2 className={h2}>10. Modification des CGU</h2>
      <p>
        Les CGU peuvent être modifiées ; la date de mise à jour figure en tête de page. La poursuite
        de l’utilisation après information peut valoir acceptation des nouvelles conditions, selon les
        modalités affichées dans l’application.
      </p>

      <h2 className={h2}>11. Droit applicable et litiges</h2>
      <p>
        Les CGU sont régies par le <strong>droit français</strong>. En l’absence de règlement amiable,
        compétence des tribunaux français, sous réserve des règles d’ordre public.
      </p>

      <p className="pt-6 text-xs text-[#9CA3AF]">
        <Link href={LEGAL_ROUTES.mentions} className="text-[#93C572] hover:underline">
          Mentions légales
        </Link>
      </p>
    </LegalDocumentLayout>
  )
}
