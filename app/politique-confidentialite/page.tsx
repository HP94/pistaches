import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocumentLayout from '@/components/LegalDocumentLayout'
import { LEGAL_ROUTES } from '@/lib/legal/routes'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Pistâches',
  description:
    'Traitement des données personnelles pour le service Pistâches (RGPD, France).',
}

const h2 = 'mt-8 text-base font-semibold text-[#1F2937] first:mt-0'
const ul = 'mt-2 list-disc space-y-1 pl-5'

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalDocumentLayout title="Politique de confidentialité" lastUpdated="12 avril 2026">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Document d’information à caractère général, non substitut à un conseil juridique. Faites
        valider les textes par un professionnel avant engagement fort.
      </p>

      <p>
        La présente politique décrit comment sont traitées les données personnelles dans le cadre du
        service en ligne <strong>Pistâches</strong> (gestion des tâches et de la charge au sein d’un
        foyer), proposé aux utilisateurs situés en priorité en <strong>France</strong>.
      </p>

      <h2 className={h2}>1. Responsable du traitement</h2>
      <p>
        <strong>Romain Perroud</strong> (personne physique), responsable du traitement des données.
      </p>
      <p>
        Pour exercer vos droits ou pour toute question relative à vos données :{' '}
        <a href="mailto:r.perroud.pro@gmail.com" className="font-medium text-[#93C572] hover:underline">
          r.perroud.pro@gmail.com
        </a>
        .
      </p>

      <h2 className={h2}>2. Données collectées</h2>
      <p>Selon votre utilisation du service, peuvent être traitées notamment :</p>
      <ul className={ul}>
        <li>
          <strong>Compte</strong> : adresse e-mail, identifiants techniques ; mot de passe géré par
          le prestataire d’authentification (Supabase) ; connexion possible via Google (OAuth).
        </li>
        <li>
          <strong>Participants</strong> : prénom ou pseudo, genre déclaré, lien avec un compte
          utilisateur le cas échéant ; les personnes sans compte peuvent être enregistrées par un
          adulte du foyer (ex. enfant).
        </li>
        <li>
          <strong>Foyer</strong> : nom du foyer, code d’invitation, rattachement des membres.
        </li>
        <li>
          <strong>Activité</strong> : tâches, assignations, points (réalisation / charge mentale),
          historique utile au fonctionnement et aux statistiques internes.
        </li>
        <li>
          <strong>Données techniques</strong> : journaux et métadonnées de sécurité ou d’hébergement
          (ex. adresse IP, cookies ou stockage local de session), selon les prestataires.
        </li>
      </ul>

      <h2 className={h2}>3. Google Sign-In</h2>
      <p>
        Les scopes demandés à Google sont limités (notamment <strong>openid</strong> et{' '}
        <strong>e-mail</strong>). Des informations de profil (ex. nom affiché) peuvent néanmoins
        figurer dans les métadonnées du compte géré par Supabase selon le comportement du fournisseur.
        Le <strong>nom affiché dans l’application pour un participant</strong> repose sur la saisie
        (prénom / pseudo) ou l’e-mail, et non sur une reprise automatique du nom Google dans les
        données métier — conformément à la politique produit retenue.
      </p>

      <h2 className={h2}>4. Finalités et bases légales</h2>
      <ul className={ul}>
        <li>
          <strong>Fourniture du service</strong> (compte, foyer, tâches, équilibre, affichages) :{' '}
          <strong>exécution du contrat</strong> ou mesures précontractuelles (art. 6(1)(b) RGPD).
        </li>
        <li>
          <strong>Sécurité et prévention des abus</strong> : <strong>intérêt légitime</strong> (art.
          6(1)(f) RGPD), dans des limites proportionnées.
        </li>
        <li>
          <strong>Statistiques et recherche</strong> sur la répartition des tâches et de la charge
          mentale selon le genre déclaré (traitement pseudonymisé ou agrégé, finalité décrite au
          moment du recueil du consentement) : <strong>consentement</strong> (art. 6(1)(a) RGPD). Le{' '}
          <strong>refus</strong> n’empêche pas l’utilisation du service ; seules les personnes ayant
          accepté sont incluses dans ce traitement (indicateur en base).
        </li>
        <li>
          <strong>Administration technique et support bêta</strong> (accès par le responsable aux
          outils et à la base pour maintenance et sécurité) : <strong>intérêt légitime</strong> (art.
          6(1)(f) RGPD), de manière proportionnée.
        </li>
      </ul>

      <h2 className={h2}>5. Destinataires et sous-traitants</h2>
      <p>
        Les données sont accessibles aux <strong>membres du même foyer</strong> selon les règles du
        service et les politiques d’accès en base (ex. RLS).
      </p>
      <p>
        <strong>Sous-traitants</strong> (traitement pour le compte du responsable) : notamment{' '}
        <strong>Supabase</strong> (hébergement de la base et authentification — région indiquée dans
        votre projet, ex. Union européenne), <strong>Vercel</strong> (hébergement de l’application web
        — ex. fonctions en France), <strong>Google</strong> (OAuth). Les transferts hors Union
        européenne éventuels dépendent des contrats et documents des prestataires (DPA, clauses types,
        etc.) — voir leurs sites officiels.
      </p>
      <ul className={`${ul} text-xs`}>
        <li>
          <a href="https://supabase.com/legal" target="_blank" rel="noopener noreferrer">
            Supabase — Legal
          </a>
        </li>
        <li>
          <a href="https://vercel.com/legal" target="_blank" rel="noopener noreferrer">
            Vercel — Legal
          </a>
        </li>
        <li>
          <a href="https://cloud.google.com/terms" target="_blank" rel="noopener noreferrer">
            Google Cloud — Conditions
          </a>
        </li>
      </ul>

      <h2 className={h2}>6. Durées de conservation</h2>
      <ul className={ul}>
        <li>
          <strong>Compte actif</strong> : données conservées tant que le compte existe.
        </li>
        <li>
          <strong>Inactivité</strong> : après <strong>2 ans</strong> sans connexion significative, une
          relance peut être envoyée ; à l’issue d’un <strong>délai de grâce de 30 jours</strong>,
          suppression ou anonymisation des données personnelles (sauf obligation légale contraire).
        </li>
        <li>
          <strong>Demande d’effacement</strong> : réponse dans un délai habituel d’
          <strong>un mois</strong> (prolongation possible avec motif, conformément au RGPD).
        </li>
        <li>
          <strong>Foyer</strong> : en cas de <strong>suppression du compte du propriétaire du foyer</strong>, le{' '}
          <strong>foyer et les données associées</strong> sont supprimés (règle métier).
        </li>
        <li>
          <strong>Journaux</strong> hébergeurs : durées définies par les prestataires ou la
          configuration du projet ; révision périodique recommandée.
        </li>
        <li>
          <strong>Données de recherche</strong> (consentement) : durée précisée lorsque le dispositif
          est en production ; principe de limitation à la finalité.
        </li>
      </ul>

      <h2 className={h2}>7. Vos droits</h2>
      <p>
        Vous disposez des droits d’<strong>accès</strong>, de <strong>rectification</strong>, d’
        <strong>effacement</strong>, de <strong>limitation</strong>, d’<strong>opposition</strong> (selon
        les cas) et de <strong>portabilité</strong> (lorsque applicable). Pour les traitements fondés
        sur le <strong>consentement</strong>, vous pouvez le <strong>retirer</strong> à tout moment.
      </p>
      <p>
        Contact :{' '}
        <a href="mailto:r.perroud.pro@gmail.com" className="font-medium text-[#93C572] hover:underline">
          r.perroud.pro@gmail.com
        </a>
        . Vous pouvez introduire une réclamation auprès de la{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          CNIL
        </a>{' '}
        (France).
      </p>

      <h2 className={h2}>8. Cookies et traceurs</h2>
      <p>
        Des cookies ou équivalents <strong>strictement nécessaires</strong> à la session de connexion
        et à la sécurité peuvent être utilisés. En l’absence d’outils d’analytics ou de publicité non
        essentiels, aucune bannière de consentement supplémentaire n’est requise pour ces seuls
        traceurs — sous réserve de l’évolution du service.
      </p>

      <h2 className={h2}>9. Mineurs</h2>
      <p>
        L’inscription est réservée aux <strong>personnes majeures</strong>. Un adulte peut
        enregistrer un enfant comme membre du foyer <strong>sans compte</strong> ; le responsable légal
        assume la licéité de cette saisie.
      </p>

      <h2 className={h2}>10. Modifications</h2>
      <p>
        La présente politique peut être mise à jour ; la date en tête de page sera révisée. Les
        changements substantiels pourront être portés à votre attention dans l’application ou par
        e-mail.
      </p>

      <p className="pt-6 text-xs text-[#9CA3AF]">
        Voir aussi les{' '}
        <Link href={LEGAL_ROUTES.mentions} className="text-[#93C572] hover:underline">
          mentions légales
        </Link>{' '}
        et les{' '}
        <Link href={LEGAL_ROUTES.cgu} className="text-[#93C572] hover:underline">
          CGU
        </Link>
        .
      </p>
    </LegalDocumentLayout>
  )
}
