# Ajouter Pistâches à l’écran d’accueil (PWA)

L’application est une **Progressive Web App** (manifest : `app/manifest.ts`). Les utilisateurs peuvent l’installer comme une app depuis le navigateur.

## Interface utilisateur

- Composant : `components/AddToHomeScreenDrawer.tsx`
- CTA sur la page d’accueil : **« Ajouter cette app sur votre téléphone »**
- Comportement : tiroir depuis le bas sur mobile, fenêtre modale centrée sur grand écran
- Le CTA est **masqué** si l’app est déjà ouverte en mode installé (`display-mode: standalone`)

## Procédure documentée (Chrome · Android)

C’est la référence actuelle dans l’UI (texte en français).

1. Ouvrir le site dans **Google Chrome** sur Android ou Iphone.
2. Ouvrir le **menu Chrome** (⋮) ou (...).
3. Choisir **« Partager cette page »**
4. Puis **« Sur l’écran d’accueil »**.
4. Valider : l’icône apparaît sur l’écran d’accueil.

Chrome peut aussi afficher une **bannière « Installer »** sur les PWA éligibles.

## À faire plus tard

- Documenter **Safari / iOS** (étapes différentes ; pas Chrome moteur sur iOS).
- Optionnel : autres navigateurs Android (Samsung Internet, Firefox, …).

## Fichiers liés

- `app/manifest.ts` — nom, icônes, `display: standalone`
- Icônes : `public/icon-192x192.png`, `public/icon-512x512.png`
