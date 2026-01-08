# Configuration Email/Password - Guide rapide

## Étape 1 : Activer Email Provider dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Equal Housing"
3. Dans le menu de gauche, cliquez sur **"Authentication"**
4. Cliquez sur **"Providers"** (ou cherchez dans le sous-menu)
5. Trouvez **"Email"** dans la liste des providers
6. Activez le toggle **"Enable Email provider"**

## Étape 2 : Configurer les options Email (Recommandé)

Dans la même page, vous pouvez configurer :

### Options de base :
- ✅ **Enable Email provider** : Activé (déjà fait à l'étape 1)
- **Confirm email** : 
  - ❌ **Désactivé** pour le MVP (les utilisateurs peuvent se connecter immédiatement)
  - ✅ **Activé** pour la production (les utilisateurs doivent confirmer leur email)

### Options avancées (optionnel) :
- **Secure email change** : ✅ Activé (recommandé)
  - Empêche les utilisateurs de changer leur email sans confirmation
- **Double confirm email changes** : Optionnel
  - Demande confirmation à l'ancien et au nouvel email

## Étape 3 : Configurer les URLs de redirection (si pas déjà fait)

1. Dans **"Authentication"** → **"URL Configuration"**
2. Vérifiez que ces URLs sont dans **"Redirect URLs"** :
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/login
   http://localhost:3000/reset-password
   ```
3. Plus tard, ajoutez aussi vos URLs de production

## Étape 4 : Tester

1. Allez sur votre app : `http://localhost:3000/signup`
2. Créez un compte avec email/password
3. Allez sur `http://localhost:3000/login`
4. Connectez-vous avec votre email/password

## Configuration recommandée pour le MVP

Pour commencer rapidement, configurez ainsi :

```
✅ Enable Email provider : Activé
❌ Confirm email : Désactivé (pour tester rapidement)
✅ Secure email change : Activé
```

Plus tard, quand vous serez en production, vous pourrez activer "Confirm email" pour plus de sécurité.

## C'est tout !

L'authentification email/password est maintenant configurée. Les utilisateurs peuvent :
- ✅ S'inscrire avec email/password
- ✅ Se connecter avec email/password
- ✅ Demander une réinitialisation de mot de passe
- ✅ Utiliser Google OAuth (déjà configuré)

## Notes importantes

- **Mots de passe** : Automatiquement hashés avec bcrypt (Supabase le fait pour vous)
- **Sécurité** : Les mots de passe ne sont jamais stockés en clair
- **Emails** : Envoyés depuis `noreply@mail.app.supabase.io` (gratuit, plan Free)

