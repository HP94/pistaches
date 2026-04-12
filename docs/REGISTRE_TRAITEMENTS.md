# Registre des activités de traitement — Pistâches

**Document interne** — base pour conformité RGPD / repère type CNIL.  
**À faire valider** par un professionnel du droit avant toute obligation juridique formelle.

| Métadonnée | Valeur |
|------------|--------|
| **Responsable du traitement** | Romain Perroud (personne physique) |
| **Contact données personnelles** | r.perroud.pro@gmail.com |
| **Périmètre géographique visé** | France |
| **Statut du service** | Bêta, gratuite, utilisateurs sélectionnés |
| **Dernière révision du document** | 2026-04-12 |

---

## Vue d’ensemble des traitements

| ID | Intitulé | Résumé |
|----|----------|--------|
| **T1** | Fourniture du service Pistâches | Compte, foyer, membres, tâches, assignations, équilibre, genre pour affichage / logique métier |
| **T2** | Statistiques et recherche | Données pseudonymisées, finalité décrite ci-dessous, **consentement** + **flag** en application |
| **T3** | Administration technique et support bêta | Accès complet aux données par le responsable (consoles, base) |

---

## T1 — Fourniture du service Pistâches

### Identification

| Élément | Détail |
|---------|--------|
| **Nom du traitement** | Exploitation du service Pistâches (fonctionnalités grand public) |
| **Responsable du traitement** | Romain Perroud |
| **Finalités** | Permettre la gestion d’un foyer : création de compte et authentification (e-mail / mot de passe, Google OAuth) ; création et gestion de foyers et invitations ; gestion des participants (avec ou sans compte utilisateur) ; gestion des tâches, assignations, points et équilibre ; affichages et logique métier incluant le **genre** déclaré (ex. formulations) |
| **Base légale** | **Exécution du contrat** / mesures précontractuelles (art. 6(1)(b) RGPD) pour l’essentiel. **Intérêt légitime** — sécurité du service, prévention des abus, journalisation technique proportionnée (art. 6(1)(f) RGPD). |
| **Catégories de personnes concernées** | Utilisateurs inscrits ; personnes enregistrées comme membres du foyer **sans compte** (ex. enfant saisi par un adulte) |
| **Catégories de données** | Identifiants de compte (e-mail, identifiants techniques) ; données d’authentification gérées par Supabase / Google ; **nom ou pseudo** saisi pour les participants (hors reprise automatique du « display name » Google dans le parcours prévu) ; **genre** ; données du foyer (nom, code d’invitation) ; données d’activité (tâches, assignations, points, historique opérationnel) |
| **Destinataires** | Les **membres du même foyer** selon les règles produit et les politiques d’accès (ex. RLS). **Sous-traitants** : Supabase (base de données — région indiquée par le fournisseur, ex. UE Stockholm) ; Vercel (hébergement application — ex. fonctions France) ; Google (OAuth). |
| **Transferts hors UE** | Aucun, selon les DPA / politiques à jour des sous-traitants (Google, Vercel CDN / infra). |
| **Durée de conservation** | **Compte actif** : durée de vie du compte. **Inactivité** : **2 ans** sans connexion significative, après **relance** utilisateur, puis **délai de grâce 30 jours** avant suppression ou anonymisation des données personnelles (sauf obligation légale contraire). **Demande d’effacement** : traitement sous **1 mois** (calendrier usuel RGPD, prolongation motivée si besoin). **Foyer** : en cas de **suppression du compte propriétaire du foyer**, **suppression du foyer** et des données associées (règle métier retenue). |
| **Mesures de sécurité** | HTTPS ; authentification déléguée (Supabase Auth) ; contrôle d’accès en base (ex. RLS) ; secrets hors dépôt ; accès aux consoles prestataires protégés (recommandation : MFA sur comptes Google, Vercel, Supabase). |
| **Droits des personnes** | Accès, rectification, effacement, limitation, opposition (selon cas), portabilité — demandes à **r.perroud.pro@gmail.com** ; réponse sous **1 mois** ; réclamation auprès de la **CNIL** (France). |

### Précision — Google OAuth

Les scopes demandés à Google sont **réduits** (**openid**, **userinfo.email**). Des informations de profil (ex. nom affiché) peuvent **néanmoins** figurer dans les métadonnées du compte **Supabase Auth** selon le comportement du fournisseur. La **politique produit** retenue : **ne pas** utiliser ce « display name » comme **nom du participant** dans les données métier ; le nom affiché côté foyer repose sur la **saisie** (prénom / pseudo) ou l’e-mail selon les écrans.

---

## T2 — Statistiques et recherche (consentement + flag)

### Identification

| Élément | Détail |
|---------|--------|
| **Nom du traitement** | Études statistiques et recherche sur la répartition des tâches et de la charge mentale |
| **Responsable du traitement** | Romain Perroud |
| **Finalités** | Réaliser des **recueils statistiques** sur la répartition **homme / femme** (genre déclaré) des tâches et de la charge mentale **au sein des foyers**, de façon **pseudonymisée** ou agrégée, afin de **quantifier** l’équilibre ou le déséquilibre et d’**éclairer le débat social** sur ces sujets, souvent abordés de manière qualitative ou par le ressenti |
| **Base légale** | **Consentement** (art. 6(1)(a) RGPD) — case dédiée, **distincte** du contrat de service. **Mise en œuvre prévue** : **consentement** enregistré + **indicateur (flag)** en base pour **exclure** du corpus statistique toute personne n’ayant pas consenti (ou n’ayant pas activé le flag positivement, selon implémentation retenue). |
| **Caractère obligatoire** | Le **refus** du consentement **n’empêche pas** l’utilisation du service (consentement **libre**) ; seules les données des **personnes ayant consenti** (flag) sont utilisées pour **T2**. |
| **Catégories de personnes concernées** | Sous-ensemble des utilisateurs / participants concernés par les enregistrements statistiques et ayant **consenti** |
| **Catégories de données** | Données **pseudonymisées** ou agrégées issues des enregistrements de tâches, assignations, points, **genre** ; pas de réidentification au-delà du nécessaire pour la finalité |
| **Destinataires** | Romain Perroud ; éventuels **partenaires de recherche** uniquement si prévus, listés et encadrés contractuellement (à compléter si le cas se présente) |
| **Durée de conservation** | **À préciser** après validation juridique (durée de la recherche, archivage scientifique anonymisé, etc.) ; principe : pas au-delà du nécessaire à la finalité |
| **Mesures de sécurité** | Accès restreint aux jeux de données de recherche ; filtrage systématique sur le **flag de consentement** ; documentation de la méthode de pseudonymisation / agrégation |
| **Droits des personnes** | **Retrait du consentement** à tout moment (sans affecter la licéité du traitement antérieur) ; les mêmes coordonnées que T1 pour les autres droits lorsque les données restent des données personnelles |

---

## T3 — Administration technique et support bêta

### Identification

| Élément | Détail |
|---------|--------|
| **Nom du traitement** | Administration, maintenance, support utilisateurs bêta, sécurité |
| **Responsable du traitement** | Romain Perroud (accès en tant que responsable / exploitant) |
| **Finalités** | Assurer le **fonctionnement technique** du service ; **corriger** les dysfonctionnements ; répondre aux **demandes de support** des bêta-testeurs ; **sécuriser** l’infrastructure (incidents, sauvegardes si applicable) |
| **Base légale** | **Intérêt légitime** — bonne exécution et sécurité du service (art. 6(1)(f) RGPD), dans une logique **proportionnée** (pas d’exploitation commerciale des contenus des foyers hors besoin) |
| **Catégories de personnes concernées** | Tous les utilisateurs et participants enregistrés sur la plateforme |
| **Catégories de données** | **L’ensemble** des données traitées dans les bases et systèmes auxquels le responsable a accès (ex. console Supabase, tableau de bord Vercel) |
| **Destinataires** | **Romain Perroud** ; mêmes **sous-traitants techniques** que T1 lorsque l’accès passe par leurs interfaces |
| **Durée de conservation** | Alignée sur celle des données du service (T1) ; accès **ponctuel** sauf incident ou support en cours |
| **Mesures de sécurité** | Comptes d’administration sécurisés (MFA recommandé) ; principe du **moindre privilège** ; traçabilité des interventions si possible |
| **Transparence** | Mention de cet accès dans la **politique de confidentialité** à destination du public |

---

## Sous-traitants (synthèse à lier aux DPA)

| Prestataire | Rôle principal | Document à conserver |
|-------------|----------------|----------------------|
| **Supabase** | Base de données, Auth | DPA / conditions — [supabase.com/legal](https://supabase.com/legal) |
| **Vercel** | Hébergement application | DPA — [vercel.com/legal](https://vercel.com/legal) |
| **Google** | OAuth (identité) | DPA / conditions Google Cloud / Identity — [cloud.google.com/terms](https://cloud.google.com/terms) |

**Action** : conserver une **copie datée** des DPA acceptés et mettre à jour ce tableau lors de tout changement de prestataire.

---

## Évolutions prévues côté application (hors périmètre de ce fichier)

Les éléments suivants sont **planifiés** dans le code / le schéma de données, **sans être encore décrits comme déployés** dans ce registre :

1. Collecte du **consentement** T2 au **sign-up** (ou flux équivalent).
2. **Flag** en base pour **filtrer** les données entrant dans les statistiques / recherche.
3. **Ne pas** initialiser le nom du participant avec le **display name** Google.

**Après déploiement**, mettre à jour ce document (date de révision, description technique du flag, libellés exacts du consentement).

### Documents publics (application)

| Document | Chemin |
|----------|--------|
| Politique de confidentialité | `/politique-confidentialite` |
| Mentions légales | `/mentions-legales` |
| CGU (incl. bêta) | `/cgu` |

---

*Fin du registre (brouillon structuré).*
